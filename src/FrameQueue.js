function FrameQueue(n) {
    this.frameQueue = new Array(n);
    this.size = n;
    this.length = 0;
    this.front = 0;
    this.rear = 0;
}

FrameQueue.prototype.get = function(i) {
    if (i < 0 || i >= this.length) {
        return undefined;
    }
    return this.frameQueue[(this.front + i) % this.size];
};

FrameQueue.prototype.push = function(v) {
    if (this.length === this.size) {
        this.front = (this.front + 1) % this.size; // Move the front pointer to next position
    } else {
        this.length++;
    }
    this.frameQueue[this.rear] = v;
    this.rear = (this.rear + 1) % this.size; // Move the rear pointer to next position
};

FrameQueue.prototype.clear = function() {
    this.frameQueue = new Array(this.size);
    this.length = 0;
    this.front = 0;
    this.rear = 0;
};

FrameQueue.prototype.getframeQueue = function() {
    let arr = new Array(this.length);
    for(let i = 0; i < this.length; i++){
        arr[i] = this.get(i);
        //console.log("iteration" + i + " " + arr[i]);
    }
    return arr;
};

FrameQueue.prototype.isFull = function() {
    return this.length === this.size;
};

FrameQueue.prototype.isEmpty = function() {
    return this.length === 0;
};

FrameQueue.IndexError = {};

export default FrameQueue;
