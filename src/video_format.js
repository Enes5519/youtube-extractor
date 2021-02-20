const decipher = require('./decipher');

class VideoFormat{
    constructor(hasCipher, value, mimeType, video_id){
        this.hasCipher = hasCipher;
        this.value = value;
        this.mimeType = mimeType;
        this.video_id = video_id;
    }

    async downloadURL(){
        if(this.hasCipher){
            const signature = await decipher(this.video_id, this.value);
            return this.value.url + '&sig=' + signature;
        }else{
            return this.value;
        }
    }
}

module.exports = VideoFormat;