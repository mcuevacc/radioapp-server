const nodeshout = require('nodeshout');
const fs = require('fs');
const { FileReadStream, ShoutStream } = require('nodeshout');

const global = require('../config/global');
const { shuffle } = require('../utils');
const { sendEvent } = require('../services/socket');

let RadioList = require('../models/radiolist');
let PlayList = require('../models/playlist');
let User = require('../models/user');
//let Record = require('../models/record');

class Radio {
    constructor() {
        nodeshout.init();
        console.log('Libshout version: ' + nodeshout.getVersion());

        this.nowPlaying = null;
        this.nextMusic = null;
        this.isPlaying = false;
        this.skip = false;
        this.sourceActive = false;
    }

    async setNextMusic(dequeue = false) {
        try {
            this.nextMusic = null;
            let radioList = await RadioList.findOne({ 'cod': global.codRadio })
                .populate('queueList.music')
                //.populate('queueList.audio')
                .exec();

            if (!radioList) {
                let res = await this.createRadioList();
                if (!res.success) return res;
                radioList = res.data;
            } else if (radioList.queueList.length <= +dequeue) {
                let res = await this.addRandomList(radioList);
                if (!res.success) return res;
                radioList = res.data;
            }

            this.nextMusic = radioList.queueList[+dequeue];
            if (dequeue) {
                radioList.queueList.$shift();
                await radioList.save();
            }
            return { success: true };

        } catch (err) {
            return { success: false, msg: err.message };
        }
    }

    async createRadioList() {
        try {
            let radiolist = new RadioList({
                cod: global.codRadio,
            });

            let radiolistDB = await radiolist.save();
            return await this.addRandomList(radiolistDB);

        } catch (err) {
            return { success: false, msg: err.message };
        }
    }

    async addRandomList(radiolist) {
        try {
            let admins = await User.find({
                role: { $in: ['admin'] },
                isActive: true,
                privateMusic: false
            });
            if (!admins.length)
                return { success: false, msg: 'Not admins active' };

            admins = admins.map(admin => admin._id);
            let adminPlayLists = await PlayList
                .find({ $where: `this.musicList.length >= ${global.minRadioPlayList}` })
                .where('user').in(admins)
                .populate('musicList');

            adminPlayLists = shuffle(adminPlayLists);
            let queueList = [];
            for (let adminPlayList of adminPlayLists) {
                let user = adminPlayList.user;
                let musicList = shuffle(adminPlayList.musicList);
                queueList = musicList.filter(music => !music.private).map(music => ({ music: music._id, user }));
                if (queueList.length)
                    break;
            }
            if (!queueList.length)
                return { success: false, msg: 'Not admins playlist' };

            queueList.forEach(music => radiolist.queueList.push(music));
            await radiolist.save();
            return { success: true, data: await radiolist.populate('queueList.music').execPopulate() }

        } catch (err) {
            return { success: false, msg: err.message };
        }
    }

    async playMusic() {
        try {
            if (this.isPlaying)
                return { success: false, msg: 'Radio already playing' };

            if (!this.nextMusic)
                return { success: false, msg: 'Not exist nextMusic' };

            if (this.sourceActive)
                return { success: false, msg: 'Waiting for the Icecast source finish' };

            this.initIceSouce();
            this.isPlaying = true;
            this.playNextMusic();

            return { success: true };

        } catch (err) {
            return { success: false, msg: err.message };
        }
    }

    initIceSouce() {
        this.shout = nodeshout.create();
        this.shout.setHost(process.env.ICE_HOST);
        this.shout.setPort(process.env.ICE_PORT);
        this.shout.setUser(process.env.ICE_USER);
        this.shout.setPassword(process.env.ICE_PASSWORD);
        this.shout.setMount(process.env.ICE_MOUNT);
        this.shout.setFormat(process.env.ICE_FORMAT);
        this.shout.setAudioInfo('bitrate', process.env.ICE_BITRATE);
        this.shout.setAudioInfo('samplerate', process.env.ICE_SAMPLERATE);
        this.shout.setAudioInfo('channels', process.env.ICE_CHANNELS);
        this.shout.open();

        this.sourceActive = true;
    }

    async playNextMusic() {
        try {
            console.log('Llamando a playNextMusic');
            if (!this.isPlaying) {
                console.log('Radio already stopped');
                return;
            }

            if (!this.nextMusic) {
                this.stopMusic();
                console.log('Stopping for not exist nextMusic');
                return;
            }

            this.nowPlaying = this.nextMusic;
            this.sendMusic();
            this.sendMetadata();
            let resp = await this.setNextMusic(true);
            console.log('setNextMusic', resp);

            return { success: true }

        } catch (err) {
            console.log(err.message);
        }
    }

    stopMusic() {
        try {
            if (!this.isPlaying)
                return { success: false, msg: 'Radio already stopped' };

            this.isPlaying = false;
            this.shout.close();

            setTimeout(() => {
                this.sourceActive = false;
                console.log('Icecast source finish');
            }, Number(process.env.ICE_SOURCE_TIMEOUT) * 1000);

            return { success: true };

        } catch (err) {
            return { success: false, msg: err.message };
        }
    }

    skipMusic() {
        try {
            if (!this.isPlaying)
                return { success: false, msg: 'Radio already stopped' };

            if (this.skip)
                return { success: false, msg: 'Radio already skipped' };

            this.skip = true;
            return { success: true };

        } catch (err) {
            return { success: false, msg: err.message };
        }
    }

    async sendMusic() {
        console.log('Llamando a sendMusic');
        let music = this.nowPlaying.music;

        console.log(`Playing: ${music.name}`);
        fs.open(`${ global.musicAudioPath }/${ music.user }/${ music._id }.${ music.extension }`, 'r', (status, fd) => {
            if (status) {
                console.log(status.message);
                return;
            }

            fs.fstat(fd, (err, stats) => {
                const fileSize = stats.size,
                    bufferSize = fileSize;

                let chunkSize = Number(process.env.ICE_BURST_SIZE),
                    bytesRead = 0;

                let read = () => {
                    let buffer = Buffer.alloc(bufferSize);

                    if ((bytesRead >= fileSize) || this.skip) {
                        if (this.skip) {
                            this.skip = false;
                            console.log(`Skipped: ${music.name}`);
                        } else
                            console.log(`Finished: ${music.name}`);

                        fs.closeSync(fd);
                        this.playNextMusic();
                        return;
                    }

                    if ((bytesRead + 2 * chunkSize) > fileSize)
                        chunkSize = (fileSize - bytesRead);

                    fs.read(fd, buffer, 0, chunkSize, bytesRead, (err, bytesRead_, buffer) => {
                        if (err) {
                            console.log('error aca papu', e);
                            debugger;
                            return;
                        }

                        bytesRead += bytesRead_;
                        console.log('Bytes read:' + bytesRead + ' Total:' + fileSize);

                        if (bytesRead_ > 0) {
                            this.shout.send(buffer, bytesRead_);
                            setTimeout(read, Math.abs(this.shout.delay()));
                        } else {
                            console.log('Zero bytes read, stopping');
                            fs.closeSync(fd);
                            this.stopMusic();
                        }
                    });
                }

                read();
            });
        });
    }

    async sendMetadata() {
        console.log('Llamando a sendMetadata');
        let data = this.getMetadata();
        sendEvent({
            all: true,
            guest: true,
            event: {
                i: 'radio.playing',
                data,
            }
        });
        /*
        let metadata = nodeshout.createMetadata();
        metadata.add('song', data.name);
        this.shout.setMetadata(metadata);
        */
    }

    getMetadata() {
        let { type, music } = this.nowPlaying;
        let data = null;
        if (type === 'music') {
            data = {
                artist: music.artist,
                title: music.title,
                name: music.name
            }
        }
        return data;
    }
}

module.exports = Radio;