import { Injectable } from '@angular/core';
import lottie, { AnimationItem } from 'lottie-web';

@Injectable({
  providedIn: 'root'
})
export class LottieService {
  private animations: Map<string, AnimationItem> = new Map();

  constructor() { }

  loadAnimation(
    container: HTMLElement,
    animationData: any,
    options: {
      loop?: boolean;
      autoplay?: boolean;
      name?: string;
      renderer?: 'svg' | 'canvas' | 'html';
    } = {}
  ): AnimationItem {
    const defaultOptions = {
      loop: true,
      autoplay: true,
      renderer: 'svg' as const,
      ...options
    };

    const animation = lottie.loadAnimation({
      container,
      animationData,
      ...defaultOptions
    });

    if (options.name) {
      this.animations.set(options.name, animation);
    }

    return animation;
  }

  loadAnimationFromUrl(
    container: HTMLElement,
    path: string,
    options: {
      loop?: boolean;
      autoplay?: boolean;
      name?: string;
      renderer?: 'svg' | 'canvas' | 'html';
    } = {}
  ): AnimationItem {
    const defaultOptions = {
      loop: true,
      autoplay: true,
      renderer: 'svg' as const,
      ...options
    };

    const animation = lottie.loadAnimation({
      container,
      path,
      ...defaultOptions
    });

    if (options.name) {
      this.animations.set(options.name, animation);
    }

    return animation;
  }

  getAnimation(name: string): AnimationItem | undefined {
    return this.animations.get(name);
  }

  play(name: string): void {
    const animation = this.animations.get(name);
    if (animation) {
      animation.play();
    }
  }

  pause(name: string): void {
    const animation = this.animations.get(name);
    if (animation) {
      animation.pause();
    }
  }

  stop(name: string): void {
    const animation = this.animations.get(name);
    if (animation) {
      animation.stop();
    }
  }

  destroy(name: string): void {
    const animation = this.animations.get(name);
    if (animation) {
      animation.destroy();
      this.animations.delete(name);
    }
  }

  destroyAll(): void {
    this.animations.forEach((animation, name) => {
      animation.destroy();
    });
    this.animations.clear();
  }

  createCheckmarkAnimation(): any {
    return {
      "v": "5.7.4",
      "fr": 60,
      "ip": 0,
      "op": 60,
      "w": 100,
      "h": 100,
      "nm": "Checkmark",
      "ddd": 0,
      "assets": [],
      "layers": [
        {
          "ddd": 0,
          "ind": 1,
          "ty": 4,
          "nm": "Checkmark",
          "sr": 1,
          "ks": {
            "o": {"a": 0, "k": 100},
            "r": {"a": 0, "k": 0},
            "p": {"a": 0, "k": [50, 50, 0]},
            "a": {"a": 0, "k": [0, 0, 0]},
            "s": {"a": 0, "k": [100, 100, 100]}
          },
          "ao": 0,
          "shapes": [
            {
              "ty": "gr",
              "it": [
                {
                  "ind": 0,
                  "ty": "sh",
                  "ks": {
                    "a": 1,
                    "k": [
                      {
                        "i": {"x": 0.833, "y": 0.833},
                        "o": {"x": 0.167, "y": 0.167},
                        "t": 0,
                        "s": [{"i": [[0,0],[0,0],[0,0]], "o": [[0,0],[0,0],[0,0]], "v": [[-20,-5],[-20,-5],[-20,-5]], "c": false}]
                      },
                      {
                        "t": 60,
                        "s": [{"i": [[0,0],[0,0],[0,0]], "o": [[0,0],[0,0],[0,0]], "v": [[-20,-5],[-5,10],[25,-15]], "c": false}]
                      }
                    ]
                  }
                },
                {
                  "ty": "st",
                  "c": {"a": 0, "k": [0.635, 0.831, 0.435, 1]},
                  "o": {"a": 0, "k": 100},
                  "w": {"a": 0, "k": 6},
                  "lc": 2,
                  "lj": 2
                }
              ]
            }
          ],
          "ip": 0,
          "op": 60,
          "st": 0
        }
      ]
    };
  }

  createLoadingAnimation(): any {
    return {
      "v": "5.7.4",
      "fr": 60,
      "ip": 0,
      "op": 120,
      "w": 100,
      "h": 100,
      "nm": "Loading",
      "ddd": 0,
      "assets": [],
      "layers": [
        {
          "ddd": 0,
          "ind": 1,
          "ty": 4,
          "nm": "Circle",
          "sr": 1,
          "ks": {
            "o": {"a": 0, "k": 100},
            "r": {
              "a": 1,
              "k": [
                {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]},
                {"t": 120, "s": [360]}
              ]
            },
            "p": {"a": 0, "k": [50, 50, 0]},
            "a": {"a": 0, "k": [0, 0, 0]},
            "s": {"a": 0, "k": [100, 100, 100]}
          },
          "ao": 0,
          "shapes": [
            {
              "ty": "gr",
              "it": [
                {
                  "d": 1,
                  "ty": "el",
                  "s": {"a": 0, "k": [60, 60]},
                  "p": {"a": 0, "k": [0, 0]}
                },
                {
                  "ty": "st",
                  "c": {"a": 0, "k": [0.635, 0, 1, 1]},
                  "o": {"a": 0, "k": 100},
                  "w": {"a": 0, "k": 4},
                  "lc": 2,
                  "d": [{"n": "d", "nm": "dash", "v": {"a": 0, "k": 20}}, {"n": "g", "nm": "gap", "v": {"a": 0, "k": 10}}]
                }
              ]
            }
          ],
          "ip": 0,
          "op": 120,
          "st": 0
        }
      ]
    };
  }
}