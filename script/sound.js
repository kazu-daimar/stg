class Sound {
  constructor() {
    this.ctx = new AudioContext();
    this.source = null;
    this.node = null;
  }

  load(audioPath, callback) {
    fetch(audioPath)
    .then((responce) => {
      return responce.arrayBuffer();
    })
    .then((buffer) => {
      return this.ctx.decodeAudioData(buffer);
    })
    .then((decodeAudio) => {
      this.source = decodeAudio;
      callback();
    })
    .catch(() => {
      callback("error!");
    });
  }

  play() {
    let node = new AudioBufferSourceNode(this.ctx, {buffer: this.source});
    node.connect(this.ctx.destination);
    node.addEventListener("ended", () => {
      node.stop();
      node.disconnect();
      node = null;
    }, false);
    node.start();
    this.node = node;
  }

  stop() {
    this.node.stop();
  }
}