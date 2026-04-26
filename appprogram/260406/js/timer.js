export class Timer {
  constructor({ duration, onTick, onExpire }) {
    this.duration  = duration;
    this.remaining = duration;
    this.onTick    = onTick;
    this.onExpire  = onExpire;
    this._id       = null;
    this._start    = null;
    this._stopped  = false;
  }

  start() {
    this._stopped  = false;
    this._start    = Date.now();
    this.remaining = this.duration;

    this._id = setInterval(() => {
      if (this._stopped) return;
      const elapsed  = (Date.now() - this._start) / 1000;
      this.remaining = Math.max(0, this.duration - elapsed);
      this.onTick(this.remaining, this.duration);

      if (this.remaining <= 0) {
        this.stop();
        this.onExpire();
      }
    }, 100);
  }

  stop() {
    this._stopped = true;
    if (this._id !== null) {
      clearInterval(this._id);
      this._id = null;
    }
  }

  getRemainingRatio() {
    return this.duration > 0 ? this.remaining / this.duration : 0;
  }
}
