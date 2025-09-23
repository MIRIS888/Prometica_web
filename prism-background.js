// Prism Background - vanilla JavaScript WebGL implementation
class PrismBackground {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            height: options.height || 3.5,
            baseWidth: options.baseWidth || 5.5,
            animationType: options.animationType || 'rotate',
            glow: options.glow || 1,
            offset: options.offset || { x: 0, y: 0 },
            noise: options.noise || 0.5,
            transparent: options.transparent !== false,
            scale: options.scale || 3.6,
            hueShift: options.hueShift || 0,
            colorFrequency: options.colorFrequency || 1,
            hoverStrength: options.hoverStrength || 2,
            inertia: options.inertia || 0.05,
            bloom: options.bloom || 1,
            suspendWhenOffscreen: options.suspendWhenOffscreen || false,
            timeScale: options.timeScale || 0.5,
            ...options
        };

        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationFrame = null;
        this.startTime = performance.now();
        this.pointer = { x: 0, y: 0, inside: true };
        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
        this.targetYaw = 0;
        this.targetPitch = 0;

        this.init();
    }

    vertex = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    fragment = `
        precision highp float;

        uniform vec2  iResolution;
        uniform float iTime;

        uniform float uHeight;
        uniform float uBaseHalf;
        uniform mat3  uRot;
        uniform int   uUseBaseWobble;
        uniform float uGlow;
        uniform vec2  uOffsetPx;
        uniform float uNoise;
        uniform float uSaturation;
        uniform float uScale;
        uniform float uHueShift;
        uniform float uColorFreq;
        uniform float uBloom;
        uniform float uCenterShift;
        uniform float uInvBaseHalf;
        uniform float uInvHeight;
        uniform float uMinAxis;
        uniform float uPxScale;
        uniform float uTimeScale;

        vec4 tanh4(vec4 x){
            vec4 e2x = exp(2.0*x);
            return (e2x - 1.0) / (e2x + 1.0);
        }

        float rand(vec2 co){
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float sdOctaAnisoInv(vec3 p){
            vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
            float m = q.x + q.y + q.z - 1.0;
            return m * uMinAxis * 0.5773502691896258;
        }

        float sdPyramidUpInv(vec3 p){
            float oct = sdOctaAnisoInv(p);
            float halfSpace = -p.y;
            return max(oct, halfSpace);
        }

        mat3 hueRotation(float a){
            float c = cos(a), s = sin(a);
            mat3 W = mat3(
                0.299, 0.587, 0.114,
                0.299, 0.587, 0.114,
                0.299, 0.587, 0.114
            );
            mat3 U = mat3(
                0.701, -0.587, -0.114,
                -0.299,  0.413, -0.114,
                -0.300, -0.588,  0.886
            );
            mat3 V = mat3(
                0.168, -0.331,  0.500,
                0.328,  0.035, -0.500,
                -0.497,  0.296,  0.201
            );
            return W + U * c + V * s;
        }

        void main(){
            vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

            float z = 5.0;
            float d = 0.0;

            vec3 p;
            vec4 o = vec4(0.0);

            float centerShift = uCenterShift;
            float cf = uColorFreq;

            mat2 wob = mat2(1.0);
            if (uUseBaseWobble == 1) {
                float t = iTime * uTimeScale;
                float c0 = cos(t + 0.0);
                float c1 = cos(t + 33.0);
                float c2 = cos(t + 11.0);
                wob = mat2(c0, c1, c2, c0);
            }

            const int STEPS = 100;
            for (int i = 0; i < STEPS; i++) {
                p = vec3(f, z);
                p.xz = p.xz * wob;
                p = uRot * p;
                vec3 q = p;
                q.y += centerShift;
                d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
                z -= d;
                o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
            }

            o = tanh4(o * o * (uGlow * uBloom) / 1e5);

            vec3 col = o.rgb;
            float n = rand(gl_FragCoord.xy + vec2(iTime));
            col += (n - 0.5) * uNoise;
            col = clamp(col, 0.0, 1.0);

            float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
            col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

            if(abs(uHueShift) > 0.0001){
                col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
            }

            gl_FragColor = vec4(col, o.a);
        }
    `;

    init() {
        this.createCanvas();
        this.initWebGL();
        this.createProgram();
        this.setupGeometry();
        this.setupUniforms();
        this.setupEventListeners();
        this.resize();
        this.start();

        window.addEventListener('resize', () => this.resize());
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -20;
            pointer-events: none;
        `;
        this.container.appendChild(this.canvas);
    }

    initWebGL() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        this.gl = this.canvas.getContext('webgl', {
            antialias: false,
            depth: false,
            stencil: false,
            alpha: this.options.transparent,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.disable(this.gl.BLEND);
        this.dpr = dpr;
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vertex);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fragment);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(this.program));
            return;
        }

        this.gl.useProgram(this.program);
    }

    setupGeometry() {
        // Create fullscreen triangle
        const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    setupUniforms() {
        const H = Math.max(0.001, this.options.height);
        const BW = Math.max(0.001, this.options.baseWidth);
        const BASE_HALF = BW * 0.5;

        this.uniforms = {
            iResolution: this.gl.getUniformLocation(this.program, 'iResolution'),
            iTime: this.gl.getUniformLocation(this.program, 'iTime'),
            uHeight: this.gl.getUniformLocation(this.program, 'uHeight'),
            uBaseHalf: this.gl.getUniformLocation(this.program, 'uBaseHalf'),
            uRot: this.gl.getUniformLocation(this.program, 'uRot'),
            uUseBaseWobble: this.gl.getUniformLocation(this.program, 'uUseBaseWobble'),
            uGlow: this.gl.getUniformLocation(this.program, 'uGlow'),
            uOffsetPx: this.gl.getUniformLocation(this.program, 'uOffsetPx'),
            uNoise: this.gl.getUniformLocation(this.program, 'uNoise'),
            uSaturation: this.gl.getUniformLocation(this.program, 'uSaturation'),
            uScale: this.gl.getUniformLocation(this.program, 'uScale'),
            uHueShift: this.gl.getUniformLocation(this.program, 'uHueShift'),
            uColorFreq: this.gl.getUniformLocation(this.program, 'uColorFreq'),
            uBloom: this.gl.getUniformLocation(this.program, 'uBloom'),
            uCenterShift: this.gl.getUniformLocation(this.program, 'uCenterShift'),
            uInvBaseHalf: this.gl.getUniformLocation(this.program, 'uInvBaseHalf'),
            uInvHeight: this.gl.getUniformLocation(this.program, 'uInvHeight'),
            uMinAxis: this.gl.getUniformLocation(this.program, 'uMinAxis'),
            uPxScale: this.gl.getUniformLocation(this.program, 'uPxScale'),
            uTimeScale: this.gl.getUniformLocation(this.program, 'uTimeScale')
        };

        // Set initial uniform values
        this.gl.uniform1f(this.uniforms.uHeight, H);
        this.gl.uniform1f(this.uniforms.uBaseHalf, BASE_HALF);
        this.gl.uniform1f(this.uniforms.uGlow, Math.max(0.0, this.options.glow));
        this.gl.uniform1f(this.uniforms.uNoise, Math.max(0.0, this.options.noise));
        this.gl.uniform1f(this.uniforms.uSaturation, this.options.transparent ? 1.5 : 1);
        this.gl.uniform1f(this.uniforms.uScale, Math.max(0.001, this.options.scale));
        this.gl.uniform1f(this.uniforms.uHueShift, this.options.hueShift || 0);
        this.gl.uniform1f(this.uniforms.uColorFreq, Math.max(0.0, this.options.colorFrequency || 1));
        this.gl.uniform1f(this.uniforms.uBloom, Math.max(0.0, this.options.bloom || 1));
        this.gl.uniform1f(this.uniforms.uCenterShift, H * 0.25);
        this.gl.uniform1f(this.uniforms.uInvBaseHalf, 1 / BASE_HALF);
        this.gl.uniform1f(this.uniforms.uInvHeight, 1 / H);
        this.gl.uniform1f(this.uniforms.uMinAxis, Math.min(BASE_HALF, H));
        this.gl.uniform1f(this.uniforms.uTimeScale, Math.max(0, this.options.timeScale || 1));

        // Set animation type
        if (this.options.animationType === 'hover') {
            this.gl.uniform1i(this.uniforms.uUseBaseWobble, 0);
        } else if (this.options.animationType === '3drotate') {
            this.gl.uniform1i(this.uniforms.uUseBaseWobble, 0);
        } else {
            this.gl.uniform1i(this.uniforms.uUseBaseWobble, 1);
        }

        this.rotBuf = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        this.gl.uniformMatrix3fv(this.uniforms.uRot, false, this.rotBuf);

        // Random rotation parameters for 3drotate
        this.wX = (0.3 + Math.random() * 0.6);
        this.wY = (0.2 + Math.random() * 0.7);
        this.wZ = (0.1 + Math.random() * 0.5);
        this.phX = Math.random() * Math.PI * 2;
        this.phZ = Math.random() * Math.PI * 2;
    }

    setupEventListeners() {
        if (this.options.animationType === 'hover') {
            this.onPointerMove = (e) => {
                this.updatePointer(e);
                this.start();
            };
            window.addEventListener('pointermove', this.onPointerMove, { passive: true });
            window.addEventListener('mouseleave', () => { this.pointer.inside = false; });
            window.addEventListener('blur', () => { this.pointer.inside = false; });
        }
    }

    updatePointer(e) {
        const ww = Math.max(1, window.innerWidth);
        const wh = Math.max(1, window.innerHeight);
        const cx = ww * 0.5;
        const cy = wh * 0.5;
        const nx = (e.clientX - cx) / (ww * 0.5);
        const ny = (e.clientY - cy) / (wh * 0.5);
        this.pointer.x = Math.max(-1, Math.min(1, nx));
        this.pointer.y = Math.max(-1, Math.min(1, ny));
        this.pointer.inside = true;
    }

    setMat3FromEuler(yawY, pitchX, rollZ) {
        const cy = Math.cos(yawY), sy = Math.sin(yawY);
        const cx = Math.cos(pitchX), sx = Math.sin(pitchX);
        const cz = Math.cos(rollZ), sz = Math.sin(rollZ);

        this.rotBuf[0] = cy * cz + sy * sx * sz;
        this.rotBuf[1] = cx * sz;
        this.rotBuf[2] = -sy * cz + cy * sx * sz;
        this.rotBuf[3] = -cy * sz + sy * sx * cz;
        this.rotBuf[4] = cx * cz;
        this.rotBuf[5] = sy * sz + cy * sx * cz;
        this.rotBuf[6] = sy * cx;
        this.rotBuf[7] = -sx;
        this.rotBuf[8] = cy * cx;

        return this.rotBuf;
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uniforms.iResolution, this.canvas.width, this.canvas.height);

        const offX = (this.options.offset?.x || 0) * this.dpr;
        const offY = (this.options.offset?.y || 0) * this.dpr;
        this.gl.uniform2f(this.uniforms.uOffsetPx, offX, offY);
        this.gl.uniform1f(this.uniforms.uPxScale, 1 / ((this.canvas.height || 1) * 0.1 * this.options.scale));
    }

    render() {
        const currentTime = ((performance.now() - this.startTime) / 1000);
        this.gl.uniform1f(this.uniforms.iTime, currentTime);

        let continueRAF = true;

        if (this.options.animationType === 'hover') {
            const maxPitch = 0.6 * this.options.hoverStrength;
            const maxYaw = 0.6 * this.options.hoverStrength;
            this.targetYaw = (this.pointer.inside ? -this.pointer.x : 0) * maxYaw;
            this.targetPitch = (this.pointer.inside ? this.pointer.y : 0) * maxPitch;

            this.yaw = this.lerp(this.yaw, this.targetYaw, this.options.inertia);
            this.pitch = this.lerp(this.pitch, this.targetPitch, this.options.inertia);
            this.roll = this.lerp(this.roll, 0, 0.1);

            this.gl.uniformMatrix3fv(this.uniforms.uRot, false, this.setMat3FromEuler(this.yaw, this.pitch, this.roll));

            if (this.options.noise < 1e-6) {
                const settled = Math.abs(this.yaw - this.targetYaw) < 1e-4 &&
                               Math.abs(this.pitch - this.targetPitch) < 1e-4 &&
                               Math.abs(this.roll) < 1e-4;
                if (settled) continueRAF = false;
            }
        } else if (this.options.animationType === '3drotate') {
            const tScaled = currentTime * this.options.timeScale;
            this.yaw = tScaled * this.wY;
            this.pitch = Math.sin(tScaled * this.wX + this.phX) * 0.6;
            this.roll = Math.sin(tScaled * this.wZ + this.phZ) * 0.5;

            this.gl.uniformMatrix3fv(this.uniforms.uRot, false, this.setMat3FromEuler(this.yaw, this.pitch, this.roll));

            if (this.options.timeScale < 1e-6) continueRAF = false;
        } else {
            // Identity matrix for basic animation
            this.rotBuf.fill(0);
            this.rotBuf[0] = this.rotBuf[4] = this.rotBuf[8] = 1;
            this.gl.uniformMatrix3fv(this.uniforms.uRot, false, this.rotBuf);

            if (this.options.timeScale < 1e-6) continueRAF = false;
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);

        if (continueRAF) {
            this.animationFrame = requestAnimationFrame(() => this.render());
        } else {
            this.animationFrame = null;
        }
    }

    start() {
        if (this.animationFrame) return;
        this.animationFrame = requestAnimationFrame(() => this.render());
    }

    updateOptions(newOptions) {
        Object.assign(this.options, newOptions);
        this.setupUniforms();
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.onPointerMove) {
            window.removeEventListener('pointermove', this.onPointerMove);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', this.resize.bind(this));
    }
}

// Export for use
window.PrismBackground = PrismBackground;