/**
 * LightRays - Vanilla JavaScript WebGL Light Rays Effect
 * Converted from React component to pure JavaScript
 */
class LightRays {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            raysOrigin: 'top-center',
            raysColor: '#ffffff',
            raysSpeed: 1,
            lightSpread: 1,
            rayLength: 2,
            pulsating: false,
            fadeDistance: 1.0,
            saturation: 1.0,
            followMouse: true,
            mouseInfluence: 0.1,
            noiseAmount: 0.0,
            distortion: 0.0,
            ...options
        };

        this.uniforms = null;
        this.renderer = null;
        this.mouse = { x: 0.5, y: 0.5 };
        this.smoothMouse = { x: 0.5, y: 0.5 };
        this.animationId = null;
        this.mesh = null;
        this.isVisible = false;
        this.observer = null;

        this.init();
    }

    hexToRgb(hex) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
    }

    getAnchorAndDir(origin, w, h) {
        const outside = 0.2;
        switch (origin) {
            case 'top-left':
                return { anchor: [0, -outside * h], dir: [0, 1] };
            case 'top-right':
                return { anchor: [w, -outside * h], dir: [0, 1] };
            case 'left':
                return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
            case 'right':
                return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
            case 'bottom-left':
                return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
            case 'bottom-center':
                return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
            case 'bottom-right':
                return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
            default: // "top-center"
                return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
        }
    }

    async init() {
        if (!this.container) return;

        // Setup intersection observer for performance
        this.observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                this.isVisible = entry.isIntersecting;
                if (this.isVisible && !this.renderer) {
                    this.initializeWebGL();
                }
            },
            { threshold: 0.1 }
        );

        this.observer.observe(this.container);

        // Setup mouse tracking
        if (this.options.followMouse) {
            this.handleMouseMove = (e) => {
                if (!this.container || !this.renderer) return;
                const rect = this.container.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                this.mouse = { x, y };
            };
            window.addEventListener('mousemove', this.handleMouseMove);
        }
    }

    async initializeWebGL() {
        if (!this.container || this.renderer) return;

        await new Promise(resolve => setTimeout(resolve, 10));

        if (!this.container) return;

        try {
            // Import OGL dynamically
            const { Renderer, Program, Triangle, Mesh } = await import('https://cdn.skypack.dev/ogl');

            this.renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                alpha: true
            });

            const gl = this.renderer.gl;
            gl.canvas.style.width = '100%';
            gl.canvas.style.height = '100%';
            gl.canvas.style.position = 'absolute';
            gl.canvas.style.top = '0';
            gl.canvas.style.left = '0';
            gl.canvas.style.pointerEvents = 'none';
            gl.canvas.style.zIndex = '1';

            // Clear container and add canvas
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
            this.container.appendChild(gl.canvas);

            // Vertex shader
            const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

            // Fragment shader
            const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.8 + rays2 * 0.7;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.3 + brightness * 1.2;
  fragColor.y *= 0.5 + brightness * 0.9;
  fragColor.z *= 0.7 + brightness * 0.8;

  // Enhanced glow effect
  fragColor.rgb *= 1.5;
  fragColor.a *= 0.9;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

            // Setup uniforms
            this.uniforms = {
                iTime: { value: 0 },
                iResolution: { value: [1, 1] },
                rayPos: { value: [0, 0] },
                rayDir: { value: [0, 1] },
                raysColor: { value: this.hexToRgb(this.options.raysColor) },
                raysSpeed: { value: this.options.raysSpeed },
                lightSpread: { value: this.options.lightSpread },
                rayLength: { value: this.options.rayLength },
                pulsating: { value: this.options.pulsating ? 1.0 : 0.0 },
                fadeDistance: { value: this.options.fadeDistance },
                saturation: { value: this.options.saturation },
                mousePos: { value: [0.5, 0.5] },
                mouseInfluence: { value: this.options.mouseInfluence },
                noiseAmount: { value: this.options.noiseAmount },
                distortion: { value: this.options.distortion }
            };

            // Create geometry and program
            const geometry = new Triangle(gl);
            const program = new Program(gl, {
                vertex: vert,
                fragment: frag,
                uniforms: this.uniforms
            });
            this.mesh = new Mesh(gl, { geometry, program });

            // Setup resize handler
            this.handleResize = () => {
                this.updatePlacement();
            };
            window.addEventListener('resize', this.handleResize);

            this.updatePlacement();
            this.startRenderLoop();

        } catch (error) {
            console.error('Failed to initialize WebGL:', error);
            // Fallback to CSS-only background
            this.container.style.background = 'radial-gradient(ellipse at center top, rgba(255,255,255,0.1) 0%, transparent 70%)';
        }
    }

    updatePlacement() {
        if (!this.container || !this.renderer) return;

        this.renderer.dpr = Math.min(window.devicePixelRatio, 2);

        const { clientWidth: wCSS, clientHeight: hCSS } = this.container;
        this.renderer.setSize(wCSS, hCSS);

        const dpr = this.renderer.dpr;
        const w = wCSS * dpr;
        const h = hCSS * dpr;

        this.uniforms.iResolution.value = [w, h];

        const { anchor, dir } = this.getAnchorAndDir(this.options.raysOrigin, w, h);
        this.uniforms.rayPos.value = anchor;
        this.uniforms.rayDir.value = dir;
    }

    startRenderLoop() {
        const loop = (t) => {
            if (!this.renderer || !this.uniforms || !this.mesh) {
                return;
            }

            this.uniforms.iTime.value = t * 0.001;

            if (this.options.followMouse && this.options.mouseInfluence > 0.0) {
                const smoothing = 0.92;
                this.smoothMouse.x = this.smoothMouse.x * smoothing + this.mouse.x * (1 - smoothing);
                this.smoothMouse.y = this.smoothMouse.y * smoothing + this.mouse.y * (1 - smoothing);
                this.uniforms.mousePos.value = [this.smoothMouse.x, this.smoothMouse.y];
            }

            try {
                this.renderer.render({ scene: this.mesh });
                this.animationId = requestAnimationFrame(loop);
            } catch (error) {
                console.warn('WebGL rendering error:', error);
                return;
            }
        };

        this.animationId = requestAnimationFrame(loop);
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };

        if (this.uniforms) {
            this.uniforms.raysColor.value = this.hexToRgb(this.options.raysColor);
            this.uniforms.raysSpeed.value = this.options.raysSpeed;
            this.uniforms.lightSpread.value = this.options.lightSpread;
            this.uniforms.rayLength.value = this.options.rayLength;
            this.uniforms.pulsating.value = this.options.pulsating ? 1.0 : 0.0;
            this.uniforms.fadeDistance.value = this.options.fadeDistance;
            this.uniforms.saturation.value = this.options.saturation;
            this.uniforms.mouseInfluence.value = this.options.mouseInfluence;
            this.uniforms.noiseAmount.value = this.options.noiseAmount;
            this.uniforms.distortion.value = this.options.distortion;

            this.updatePlacement();
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.handleResize) {
            window.removeEventListener('resize', this.handleResize);
        }

        if (this.handleMouseMove) {
            window.removeEventListener('mousemove', this.handleMouseMove);
        }

        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.renderer) {
            try {
                const canvas = this.renderer.gl.canvas;
                const loseContextExt = this.renderer.gl.getExtension('WEBGL_lose_context');
                if (loseContextExt) {
                    loseContextExt.loseContext();
                }

                if (canvas && canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
            } catch (error) {
                console.warn('Error during WebGL cleanup:', error);
            }
        }

        this.renderer = null;
        this.uniforms = null;
        this.mesh = null;
    }
}

// Global function to initialize light rays
window.initLightRays = function(selector, options = {}) {
    const containers = document.querySelectorAll(selector);
    const instances = [];

    containers.forEach(container => {
        const instance = new LightRays(container, options);
        instances.push(instance);
    });

    return instances.length === 1 ? instances[0] : instances;
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize light rays on elements with data-light-rays attribute
    const autoElements = document.querySelectorAll('[data-light-rays]');
    autoElements.forEach(element => {
        const options = element.dataset.lightRaysOptions ?
            JSON.parse(element.dataset.lightRaysOptions) : {};
        new LightRays(element, options);
    });
});