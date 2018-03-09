class Simon {
    constructor() {
      this.powerBtn = document.querySelector('.power__btn');
      this.startBtn = document.querySelector('.start__btn');
      this.strictBtn = document.querySelector('.strict__btn');
      this.lights = document.querySelectorAll('.quarter');
      this.displayCurrentMove = document.querySelector('.current__move--count');
      this.popup = document.querySelector('.popup');
      this.popupYes = document.querySelector('.popup--btn-yes');
      this.popupNo = document.querySelector('.popup--btn-no');
      this.timer;
      this.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new this.AudioContext()
      this.osc;
      this.notes = [164.81, 220.00, 277.18, 329.63];
      this.errorSound = 82.41;
      this.pattern;
      this.userPattern = [];
      this.currentMove;
      this.inputCount = 0;
      this.isOn = false;
      this.isDown = false;
      this.simon = Simon;
    }
    
    timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getRandomIntBetween(min, max) {
      return Math.floor(Math.random() * max) + min;
    }
    
    playSound(frequency, type) {
      simon.osc = simon.audioCtx.createOscillator();
      
      simon.osc.frequency.value = frequency;
      simon.osc.connect(simon.audioCtx.destination);
      simon.osc.type = type;
      simon.osc.start(0);
    }
    
    stopSound() {
      simon.osc.stop();
    }
    
    clear() {
      simon.inputCount = 0;
      simon.userPattern = [];
    }
    
    async turnOnLight(node) {
      node.classList.add('lit');
      simon.playSound(simon.notes[node.dataset.id - 1], "triangle");
      await this.timeout(600 - (simon.currentMove * 20));
      node.classList.remove('lit'); 
      simon.stopSound();
      await this.timeout(100);
    }
    
    async blink(node) {
      node.classList.add('blink');
      await this.timeout(1000);
      node.classList.remove('blink');
    }
    
    async playPattern(count) {
      simon.lights.forEach(light => light.classList.add('disable__click'));
      clearTimeout(simon.timer);
      if (count < simon.currentMove) {
        await this.timeout(300);
        const node = [...this.lights].filter(el => parseInt(el.dataset.id)===simon.pattern[count])[0];
        await this.turnOnLight(node);
        simon.playPattern(++count);
      } else if (count == simon.currentMove) {
        simon.lights.forEach(light => light.classList.remove('disable__click'));
        simon.timer = setTimeout(() => simon.handleError(simon.startBtn), 5000 - (simon.currentMove * 150));
      }
    }
    
    handleDown() {
      clearTimeout(simon.timer);
      this.classList.add('lit');
      simon.playSound(simon.notes[this.dataset.id - 1], "triangle");
      simon.isDown = true;
    }
    
    async handleUp() {
      if (simon.isDown === true) {
        simon.isDown = false;
        this.classList.remove('lit');
        simon.stopSound();
        const id = parseInt(this.dataset.id);
        if (id === simon.pattern[simon.inputCount]) {
          simon.userPattern.push(parseInt(this.dataset.id));
          simon.inputCount++;
          const currentPattern = simon.pattern.slice(0, simon.currentMove);
          if (currentPattern.join('') === simon.userPattern.join('')) {
            simon.currentMove++;
            if (simon.currentMove === 21) {
              simon.handleWin();
            } else {
              simon.displayCurrentMove.innerText = simon.currentMove;
              simon.clear();
              simon.playPattern(0);
            }
          }
        } else {
          simon.clear();
          simon.handleError(this);
        }
        simon.timer = setTimeout(() => simon.handleError(simon.startBtn), (5000 - (simon.currentMove * 150)));
      }
    }
    
    async handleError(node) {
      simon.lights.forEach(light => light.classList.add('disable__click'));
      if (simon.isStrict) {
        simon.playSound(simon.errorSound, "square");
        simon.timeout(1000);
        simon.stopSound();
        simon.handleStart();
      } else {
        let temp;
        [temp, simon.currentMove] = [simon.currentMove, -1];
        simon.playSound(simon.errorSound, "square");
        node.classList.add('shake');
        await simon.timeout(1000);
        node.classList.remove('shake');
        simon.stopSound();
        simon.currentMove = temp;
        return simon.playPattern(0);
      }
      simon.lights.forEach(light => light.classList.remove('disable__click'));
    }
    
    handlePower() {
      this.isOn = !this.isOn;
      simon.currentMove = -1;
      simon.clear();
      simon.powerBtn.classList.toggle('lit');
      simon.startBtn.classList.toggle('disable__click');
      simon.strictBtn.classList.toggle('disable__click');
      simon.lights.forEach(light => light.classList.add('disable__click'));
      simon.displayCurrentMove.innerText = this.isOn ? '--' : '';
    }
    
    async handleStart() {
      clearTimeout(simon.timer);
      simon.currentMove = -1;
      await simon.blink(simon.startBtn);
      await simon.timeout(300);
      simon.pattern = [...Array(20)].map(() => simon.getRandomIntBetween(1,4));
      simon.currentMove = 1;
      simon.displayCurrentMove.innerText = simon.currentMove;
      simon.playPattern(0);
    }
    
    handleStrict() {
      simon.isStrict = !simon.isStrict;
      simon.isStrict ? simon.strictBtn.classList.add('lit') : simon.strictBtn.classList.remove('lit');
    }
    
    handleWin() {
      simon.popup.classList.add('visible');
    }
    
    handleYes() {
      simon.popup.classList.remove('visible');
      simon.handleStart();
    }
    
    handleNo() {
      simon.popup.classList.remove('visible');
    }
  
    setEventListeners() {
      this.powerBtn.addEventListener('click', this.handlePower);
      this.startBtn.addEventListener('click', this.handleStart);
      this.strictBtn.addEventListener('click', this.handleStrict);
      this.lights.forEach(light => {
        light.addEventListener('mousedown', this.handleDown);
        light.addEventListener('mouseup', this.handleUp);
        light.addEventListener('mouseout', this.handleUp)
      });
      this.popupYes.addEventListener('click', this.handleYes);
      this.popupNo.addEventListener('click', this.handleNo);
    }
  }
  
  const simon = new Simon();
  simon.setEventListeners();
  