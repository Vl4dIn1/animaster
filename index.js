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


    /**
     * Функция, блок двигается и исчезает потом
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     */
    function moveAndHide(element, duration){
        moveCore(element, duration * 2/5, {x: 100, y: 20})
    
        const timerId = setTimeout(function() {
            fadeOut(element, duration * 3/5);
        }, duration * 2/5);

        return {
            reset: function() {
                clearTimeout(timerId);
                resetMoveAndScale(element);
                resetFadeOut(element);
            }
        };
    }
    
    function showAndHide(element, duration) {
        fadeIn(element, duration * 1/3);
        setTimeout(function() {
            fadeOut(element, duration * 1/3);
        }, duration * 1/3);
    }

    function heartBeating(element) {
        function beat() {
            scaleCore(element, 500, 1.4);
            setTimeout(function () {
                scaleCore(element, 500, 1);
            }, 500);
        }

        beat();
        const timerId = setInterval(beat, 1000);

        return {
            stop() {
                clearInterval(timerId);
            }
        };
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
        
        play: function(element) {
            let delay = 0;

            this._steps.forEach((step) => {
                setTimeout(() => {
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
                }, delay);

                delay += step.duration;
            });
            
            this._steps = [];
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

        moveAndHide,
        showAndHide,
        heartBeating
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
