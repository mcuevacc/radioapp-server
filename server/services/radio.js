const nodeshout = require('nodeshout');
const {FileReadStream, ShoutStream}  = require('nodeshout');

const global = require('../config/global');
const {shuffle} = require('../utils');

let RadioList = require('../models/radiolist');
let PlayList = require('../models/playlist');
let Audio = require('../models/audio');

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
        //try {
            console.log("Llamando a addRandomList");

            console.log(radiolist);

            let adminPlayLists = await PlayList
                .find({ $where: `this.musicList.length >= ${global.minRadioPlayList}` })
                .populate({
                    path: 'user',
                    match: { role: { $in: ['admin'] }}
                    //select: 'name age -_id'
                })
                .exec();

            if( !adminPlayLists.length){
                return {success: false};
            }

            let index = Math.floor(Math.random() * adminPlayLists.length);
            let user = adminPlayLists[index]['user'];
            let musicList = shuffle(adminPlayLists[index]['musicList']);
            musicList.forEach(music => {
                radiolist.queueList.push({music, user});
            });

            await radiolist.save();

            return {success: true, data: await radiolist.populate('queueList.music').execPopulate()}
/*
        } catch (err) {
            console.log(err.message);
            return {success:false};
        }*/
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
        //try {
            console.log("Llamando a playMusic");
            //await this.audio();

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

            await radioList.save();

            return {
                success: true
            }

        /*
        } catch (err) {
            console.log(err.message);
        }*/
    }

    sendMusic(nowPlay) {
        let music = nowPlay.music;
        var fileStream = new FileReadStream(`${ global.uploadPath }/music/${ music.user }/${ music._id }${ music.extension }`, 65536),
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
    /*
    sendMusic2(nowPlay) {
        //nodeshout.init();

        console.log(nowPlay);

        console.log('Libshout version: ' + nodeshout.getVersion());

        // Create instance and configure it.
        var shout = nodeshout.create();
        shout.setHost('localhost');
        shout.setPort(8000);
        shout.setUser('source');
        shout.setPassword('123456');
        shout.setMount('stream');
        shout.setFormat(1); // 0=ogg, 1=mp3
        shout.setAudioInfo('bitrate', '192');
        shout.setAudioInfo('samplerate', '44100');
        shout.setAudioInfo('channels', '2');

        shout.open();

        // Create file read stream and shout stream
        let music = nowPlay.music;
        var fileStream = new FileReadStream(`${ global.uploadPath }/music/${ music.user }/${ music._id }${ music.extension }`, 65536),
            shoutStream = fileStream.pipe(new ShoutStream(shout));

        fileStream.on('data', function(chunk) {
            console.log('Read %d bytes of data', chunk.length);
        });

        shoutStream.on('finish', function() {
            console.log('Finished playing...');
        });
    }
    */
    async audio() {
        console.log("Llamando a audio");
        let audio = new Audio({duration:150.05, user:"5f4ef9fe3a23f1102f2a8a69"});
        await audio.save()
    }
}

/*

var fileStream = new FileReadStream('./music.mp3', 65536),
    shoutStream = fileStream.pipe(new ShoutStream(shout));

fileStream.on('data', function(chunk) {
    console.log('Read %d bytes of data', chunk.length);
});

shoutStream.on('finish', function() {
    console.log('Finished playing...');
});

*/

module.exports = Radio;