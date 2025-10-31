import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieService } from '../../services/lottie.service';
import { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-lottie-animation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #animationContainer 
      class="lottie-container"
      [style.width]="width"
      [style.height]="height">
    </div>
  `,
  styles: [`
    .lottie-container {
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
  `]
})
export class LottieAnimationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('animationContainer', { static: true }) animationContainer!: ElementRef;
  
  @Input() animationType: 'checkmark' | 'loading' | 'custom' = 'checkmark';
  @Input() animationData?: any;
  @Input() width: string = '50px';
  @Input() height: string = '50px';
  @Input() loop: boolean = false;
  @Input() autoplay: boolean = true;
  @Input() name?: string;

  private animation?: AnimationItem;

  constructor(private lottieService: LottieService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadAnimation();
  }

  ngOnDestroy() {
    if (this.animation) {
      this.animation.destroy();
    }
    if (this.name) {
      this.lottieService.destroy(this.name);
    }
  }

  private loadAnimation() {
    if (!this.animationContainer?.nativeElement) return;

    let animationData = this.animationData;

    // Use built-in animations if no custom data provided
    if (!animationData) {
      switch (this.animationType) {
        case 'checkmark':
          animationData = this.lottieService.createCheckmarkAnimation();
          break;
        case 'loading':
          animationData = this.lottieService.createLoadingAnimation();
          break;
        default:
          console.warn('No animation data provided');
          return;
      }
    }

    this.animation = this.lottieService.loadAnimation(
      this.animationContainer.nativeElement,
      animationData,
      {
        loop: this.loop,
        autoplay: this.autoplay,
        name: this.name,
        renderer: 'svg'
      }
    );
  }

  play() {
    if (this.animation) {
      this.animation.play();
    }
  }

  pause() {
    if (this.animation) {
      this.animation.pause();
    }
  }

  stop() {
    if (this.animation) {
      this.animation.stop();
    }
  }

  replay() {
    if (this.animation) {
      this.animation.goToAndPlay(0);
    }
  }
}