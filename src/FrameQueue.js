function FrameQueue(n) {
    this.frameQueue = new Array(n);
    this.size = n;
    this.length = 0;
}

FrameQueue.prototype.get = function(i) {
    if (i < 0 || i >= this.length) {
        return undefined;
    }
    return this.frameQueue[i % this.size];
};

FrameQueue.prototype.push = function(v) {
    console.log("adding position to queue");
    if (this.length === this.size) {
        for (let i = this.size - 1; i > 0; i--) {
            this.frameQueue[i] = this.frameQueue[i - 1];
        }
    } else {
        this.length++;
    }
    this.frameQueue[0] = v;
};

FrameQueue.prototype.clear = function() {
    this.frameQueue = new Array(this.size);
    this.length = 0;
};

FrameQueue.prototype.getframeQueue = function() {
    return this.frameQueue.slice(0, this.length);
};

FrameQueue.prototype.isFull = function() {
    return this.length === this.size;
};

FrameQueue.prototype.isEmpty = function() {
    return this.length === 0;
};

FrameQueue.IndexError = {};

export default FrameQueue;
