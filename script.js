document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. CAROUSEL LOGIC
    // ==========================================
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextBtn = carousel.querySelector('.next-btn');
        const prevBtn = carousel.querySelector('.prev-btn');
        const dotsContainer = carousel.querySelector('.carousel-indicators');

        let currentIndex = 0;

        // Create Dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('indicator');
            if (index === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
            
            dot.addEventListener('click', () => {
                moveToSlide(index);
            });
        });

        const dots = Array.from(dotsContainer.children);

        const moveToSlide = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            currentIndex = index;
        };

        nextBtn.addEventListener('click', () => {
            const newIndex = (currentIndex + 1) % slides.length;
            moveToSlide(newIndex);
        });

        prevBtn.addEventListener('click', () => {
            const newIndex = (currentIndex - 1 + slides.length) % slides.length;
            moveToSlide(newIndex);
        });
    });

    // ==========================================
    // 2. THREE.JS 3D BACKGROUND (THE APPARENT ELEMENT)
    // ==========================================
    const canvas = document.getElementById('research-canvas');
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Objects (Crystalline Structures)
    const geometry = new THREE.IcosahedronGeometry(0.5, 0); // Geometric shape
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    const particles = [];
    const particleCount = 100; // Visible amount of objects

    for (let i = 0; i < particleCount; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        
        // Spread them out widely
        mesh.position.x = (Math.random() - 0.5) * 60;
        mesh.position.y = (Math.random() - 0.5) * 40;
        mesh.position.z = (Math.random() - 0.5) * 30;

        // Store original position for return logic
        mesh.userData = {
            originalX: mesh.position.x,
            originalY: mesh.position.y,
            speed: Math.random() * 0.01 + 0.005,
            rotationSpeed: Math.random() * 0.02
        };

        scene.add(mesh);
        particles.push(mesh);
    }

    // Mouse Tracking (Normalized)
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        // Convert mouse to 3D space coordinates roughly
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation Loop
    const tick = () => {
        // Raycaster logic to push particles away slightly based on mouse
        // Note: For performance/simplicity we map mouse directly to world space somewhat
        const targetX = mouseX * 30; 
        const targetY = mouseY * 20;

        particles.forEach(mesh => {
            // Rotate the shapes (Active looking)
            mesh.rotation.x += mesh.userData.rotationSpeed;
            mesh.rotation.y += mesh.userData.rotationSpeed;

            // Repulsion Logic
            const dx = mesh.position.x - targetX;
            const dy = mesh.position.y - targetY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 8) {
                // Push away
                const force = (8 - dist) * 0.5;
                mesh.position.x += (dx / dist) * force * 0.1;
                mesh.position.y += (dy / dist) * force * 0.1;
            } else {
                // Return to original
                mesh.position.x += (mesh.userData.originalX - mesh.position.x) * 0.02;
                mesh.position.y += (mesh.userData.originalY - mesh.position.y) * 0.02;
            }
        });

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ==========================================
    // 3. SCROLL FADE IN
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});