const nodeshout = require('nodeshout');
const {FileReadStream, ShoutStream}  = require('nodeshout');

const global = require('../config/global');
const {shuffle} = require('../utils');

let RadioList = require('../models/radiolist');
let PlayList = require('../models/playlist');
let User = require('../models/user');
//let Record = require('../models/record');

class Radio {
    constructor() {
        console.log("Llamando al constructor");
        nodeshout.init();
        console.log('Libshout version: ' + nodeshout.getVersion());

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
    }

    async addRandomList(radiolist) {
        try {
            console.log("Llamando a addRandomList");
            let admins = await User.find({
                role: { $in: ['admin'] },
                isActive: true,
                privateMusic: false
            });
            if( !admins.length){
                return {success: false};
            }
            admins = admins.map((admin)=>admin._id);

            let adminPlayLists = await PlayList
                .find({$where: `this.musicList.length >= ${global.minRadioPlayList}`})
                .where('user').in(admins)
                .populate('musicList');

            adminPlayLists = shuffle(adminPlayLists);
            let queueList = [];
            for (let adminPlayList of adminPlayLists) {
                let user = adminPlayList.user;
                let musicList = shuffle(adminPlayList.musicList);
                queueList = musicList.filter((music)=>!music.private).map((music)=>({music: music._id, user}));
                if(queueList.length){
                    break;
                }
            }
            if(!queueList.length){
                return {success: false};
            }

            queueList.forEach((music) => {radiolist.queueList.push(music)});      
            await radiolist.save();

            return {success: true, data: await radiolist.populate('queueList.music').execPopulate()}

        } catch (err) {
            console.log(err.message);
            return {success:false};
        }
    }

    async createRadioList() {
        try {
            console.log("Llamando a createRadioList");
            let radiolist = new RadioList({
                cod: global.codRadio,
            });

            let radiolistDB = await radiolist.save();          

            return await this.addRandomList(radiolistDB);

        } catch (err) {
            console.log(err.message);
            return {success:false};
        }
    }

    async playMusic () {
        try {
            console.log("Llamando a playMusic");
            let radioList = await RadioList.findOne({'cod': global.codRadio})
                .populate('queueList.music')
                //.populate('queueList.audio')
                .exec();

            if(!radioList){
                let res = await this.createRadioList();
                if(!res.success) return res;
                radioList = res.data;
            }else if(!radioList.queueList.length){
                let res = await this.addRandomList(radioList);
                if(!res.success) return res;
                radioList = res.data;
            }

            let nowPlay = radioList.queueList.$pop();

            this.sendMusic(nowPlay);
            this.sendMetadata(nowPlay);

            await radioList.save();

            return {
                success: true
            }

        } catch (err) {
            console.log(err.message);
        }
    }

    sendMusic(nowPlay) {
        console.log("Llamando a sendMusic");
        let music = nowPlay.music;
        var fileStream = new FileReadStream(`${ global.musicAudioPath }/${ music.user }/${ music._id }.${ music.extension }`, 65536),
            shoutStream = fileStream.pipe(new ShoutStream(this.shout));

        fileStream.on('data', function(chunk) {
            console.log('Read %d bytes of data', chunk.length);
        });
        
        let self = this;
        shoutStream.on('finish', function() {
            console.log('Finished playing...');
            self.playMusic();
        });
    }

    sendMetadata(nowPlay) {
        console.log("Llamando a sendMetadata");
        var metadata = nodeshout.createMetadata();
        metadata.add('song', nowPlay.music.name);
        this.shout.setMetadata(metadata);
    }
}

module.exports = Radio;