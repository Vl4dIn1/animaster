addListeners();
class Step {
    constructor(name, duration, params = {}) {
        this.name = name;        
        this.duration = duration; 
        this.params = params;     
    }
}

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().move(block, 1000, {x: 100, y: 10});
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().scale(block, 1000, 1.25);
        });

    let heartBeatingLogic;

    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeatingLogic = animaster().heartBeating(block);
        });
    
     document.getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            if (heartBeatingLogic) {
                heartBeatingLogic.stop();
            }
        });
    
    let moveAndHideResetLogic;
    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            moveAndHideResetLogic = animaster().moveAndHide(block, 1000); 
        });

    document.getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            if (moveAndHideResetLogic){
                moveAndHideResetLogic.reset(); 
            }
        });
}

function animaster() {
    
    /**
     * Блок плавно появляется из прозрачного.
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     */
    function fadeIn(element, duration) {
        element.style.transitionDuration =  `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    /**
     * Блок плавно исчезает.
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     */
    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    /**
     * Функция, передвигающая элемент
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     * @param translation — объект с полями x и y, обозначающими смещение блока
     */
    function moveCore(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    /**
     * Функция, увеличивающая/уменьшающая элемент
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     * @param ratio — во сколько раз увеличить/уменьшить. Чтобы уменьшить, нужно передать значение меньше 1
     */
    function scaleCore(element, duration, ratio) {
        element.style.transitionDuration =  `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }

    function resetFadeIn(element) {
        element.classList.remove('show');
        element.classList.add('hide');
        element.style.transitionDuration = null;
    }

    function resetFadeOut(element) {
        element.classList.remove('hide');
        element.classList.add('show');
        element.style.transitionDuration = null;
    }

    function resetMoveAndScale(element) {
        element.style.transform = null;
        element.style.transitionDuration = null;
    }

    function addDelay(duration) {
        this._steps.push({ name: 'delay', duration });
        return this;
    }

    return {
        _steps: [],
        
        addMove: function (duration, translation) {
            this._steps.push({ name: 'move', duration, translation });
            return this;
        },
        addScale: function (duration, ratio) {
            this._steps.push({ name: 'scale', duration, ratio });
            return this;
        },
        addFadeIn: function (duration) {
            this._steps.push({ name: 'fadeIn', duration });
            return this;
        },
        addFadeOut: function (duration) {
            this._steps.push({ name: 'fadeOut', duration });
            return this;
        },
        addDelay,
        
        buildHandler: function() {
            const context = this;
            return function() {
                context.play(this);
            };
        },

        play: function(element, cycled = false) {
            const steps = [...this._steps];
            let timerIds = [];

            const stepLogic = () => {
                let currentDelay = 0;
                steps.forEach((step) => {
                    const timerId = setTimeout(() => {
                        if (step.name === 'move') {
                            moveCore(element, step.duration, step.translation);
                        }
                        if (step.name === 'fadeIn') {
                            fadeIn(element, step.duration);
                        }
                        if (step.name === 'fadeOut') {
                            fadeOut(element, step.duration);
                        }
                        if (step.name === 'scale') {
                            scaleCore(element, step.duration, step.ratio);
                        }
                    }, currentDelay);
                    timerIds.push(timerId);
    
                    currentDelay += step.duration;
                });
                return currentDelay;
            };

            const totalDuration = stepLogic();
            let intervalId = null;

            if (cycled) {
                intervalId = setInterval(() => {
                    timerIds = [];
                    stepLogic();
                }, totalDuration);
            }

            return {
                stop: function() {
                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                    timerIds.forEach(id => clearTimeout(id));
                },
                reset: function() {
                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                    timerIds.forEach(id => clearTimeout(id));
                    
                    steps.slice().reverse().forEach(step => {
                        if (step.name === 'fadeIn') {
                            resetFadeIn(element);
                        }
                        if (step.name === 'fadeOut') {
                            resetFadeOut(element);
                        }
                        if (step.name === 'move' || step.name === 'scale') {
                            resetMoveAndScale(element);
                        }
                    });
                }
            };
        },
        
        move: function (element, duration, translation) {
            return this.addMove(duration, translation).play(element);
        },
        scale: function (element, duration, ratio) {
            return this.addScale(duration, ratio).play(element);
        },
        fadeIn: function (element, duration) {
            return this.addFadeIn(duration).play(element);
        },
        fadeOut: function (element, duration) {
            return this.addFadeOut(duration).play(element);
        },

        moveAndHide: function(element, duration) {
            return this.addMove(duration * 2/5, {x: 100, y: 20})
                .addFadeOut(duration * 3/5)
                .play(element);
        },
        showAndHide: function(element, duration) {
            return this.addFadeIn(duration * 1/3)
                .addDelay(duration * 1/3)
                .addFadeOut(duration * 1/3)
                .play(element);
        },
        heartBeating: function(element) {
            return this.addScale(500, 1.4)
                .addScale(500, 1)
                .play(element, true);
        }
    };
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}
