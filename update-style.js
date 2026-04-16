const fs = require('fs');

const newStyle = `        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-light: #f8fafc;
            --bg-card: #ffffff;
            --bg-card-hover: #f1f5f9;
            --zju-blue: #003F87;
            --zju-light-blue: #005bb5;
            --zju-gold: #D4AF37;
            --zju-gold-hover: #B8962E;
            --text-main: #0f172a;
            --text-muted: #475569;
            --border-light: rgba(0, 63, 135, 0.1);
            --shadow-subtle: 0 4px 20px rgba(0, 63, 135, 0.08);
            --shadow-glow: 0 0 20px rgba(0, 63, 135, 0.15);
        }

        body {
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: var(--text-main);
            background-color: var(--bg-light);
            background-image: 
                radial-gradient(circle at 15% 50%, rgba(0, 63, 135, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 85% 30%, rgba(212, 175, 55, 0.03) 0%, transparent 50%);
            background-attachment: fixed;
            overflow-x: hidden;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Header */
        .header {
            background-color: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-light);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            padding: 15px 0;
            transition: all 0.3s ease;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo img {
            height: 40px;
            margin-right: 12px;
            border-radius: 4px;
            background: #fff;
            padding: 2px;
        }

        .logo h1 {
            font-size: 18px;
            font-weight: bold;
            color: var(--zju-blue);
            letter-spacing: 1px;
        }

        .nav-links {
            display: flex;
            list-style: none;
        }

        .nav-links li {
            margin-left: 30px;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--text-muted);
            font-size: 15px;
            font-weight: 500;
            transition: all 0.3s;
            position: relative;
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 0;
            width: 0;
            height: 2px;
            background-color: var(--zju-blue);
            transition: width 0.3s;
        }

        .nav-links a:hover {
            color: var(--zju-blue);
        }
        
        .nav-links a:hover::after {
            width: 100%;
        }

        /* Banner Carousel */
        .banner {
            margin-top: 70px;
            position: relative;
            overflow: hidden;
            height: 650px;
            background-color: var(--bg-light);
        }

        .carousel {
            display: flex;
            width: 100%;
            height: 100%;
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .carousel-item {
            min-width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .carousel-item::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.85) 100%);
            z-index: 1;
        }

        .carousel-item:nth-child(1) { background: url('2.jpg') center/cover; }
        .carousel-item:nth-child(2) { background: url('3.jpg') center/cover; }
        .carousel-item:nth-child(3) { background: url('4.jpg') center/cover; }

        .carousel-content {
            position: relative;
            z-index: 2;
            text-align: center;
            color: var(--text-main);
            max-width: 800px;
            padding: 0 20px;
        }

        .carousel-content h2 {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 24px;
            line-height: 1.2;
            letter-spacing: 2px;
            text-shadow: 0 2px 10px rgba(255,255,255,0.8);
            background: linear-gradient(to right, var(--zju-blue), var(--zju-light-blue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .carousel-content p {
            font-size: 20px;
            margin-bottom: 40px;
            color: var(--text-muted);
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(255,255,255,0.8);
        }

        .btn {
            display: inline-block;
            padding: 14px 36px;
            background: var(--zju-blue);
            color: #fff;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            border: 1px solid transparent;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 63, 135, 0.2);
        }

        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 63, 135, 0.4);
            background: var(--zju-light-blue);
            color: #fff;
        }

        .btn-secondary {
            background: rgba(255,255,255,0.5);
            border: 1px solid var(--zju-blue);
            color: var(--zju-blue);
            margin-left: 20px;
            backdrop-filter: blur(4px);
            box-shadow: none;
        }

        .btn-secondary:hover {
            background: var(--zju-blue);
            color: #fff;
            box-shadow: 0 8px 25px rgba(0, 63, 135, 0.2);
        }

        .carousel-indicators {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            z-index: 2;
        }

        .indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: rgba(0, 63, 135, 0.3);
            cursor: pointer;
            transition: all 0.4s ease;
            box-shadow: 0 2px 4px rgba(255,255,255,0.5);
        }

        .indicator.active {
            background-color: var(--zju-blue);
            width: 32px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 63, 135, 0.3);
        }

        /* Section Styles */
        .section {
            padding: 100px 0;
            position: relative;
        }

        .section-title {
            text-align: center;
            margin-bottom: 70px;
        }

        .section-title h2 {
            font-size: 36px;
            font-weight: 800;
            color: var(--text-main);
            margin-bottom: 20px;
            display: inline-block;
            position: relative;
            padding-bottom: 15px;
            letter-spacing: 2px;
        }

        .section-title h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 4px;
            border-radius: 2px;
            background: var(--zju-gold);
        }

        .section-title p {
            font-size: 16px;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto;
        }

        /* Events Section */
        .month-slider {
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            margin-bottom: 20px;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
        }

        .month-slider::-webkit-scrollbar { display: none; }

        .month-container {
            display: flex;
            gap: 25px;
            padding-bottom: 10px;
            min-width: max-content;
        }

        .month-section {
            flex: 0 0 95%;
            max-width: 500px;
        }

        .month-title {
            background: var(--bg-card);
            border: 1px solid var(--border-light);
            border-bottom: none;
            color: var(--zju-blue);
            padding: 15px 20px;
            border-radius: 12px 12px 0 0;
        }

        .month-title h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
            border-left: 3px solid var(--zju-gold);
            padding-left: 10px;
        }

        .event-list {
            display: flex;
            flex-direction: column;
            background-color: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: 0 0 12px 12px;
            overflow: hidden;
            box-shadow: var(--shadow-subtle);
        }

        .event-item {
            display: flex;
            align-items: flex-start;
            padding: 20px;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
            border-bottom: 1px solid rgba(0,0,0,0.03);
        }

        .event-item:last-child { border-bottom: none; }

        .event-item:hover {
            background-color: var(--bg-card-hover);
            border-left-color: var(--zju-blue);
        }

        .event-date-badge {
            width: 75px;
            height: 75px;
            background: var(--bg-light);
            border: 1px solid var(--border-light);
            color: var(--zju-blue);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            text-align: center;
            margin-right: 20px;
            flex-shrink: 0;
            box-shadow: inset 0 0 10px rgba(0,63,135,0.05);
        }

        .event-date-badge .date { font-size: 18px; line-height: 1.2; }
        .event-date-badge .day { font-size: 12px; opacity: 0.7; font-weight: normal; margin-top: 4px; }

        .event-info { flex: 1; }

        .event-info h4 {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 8px;
            line-height: 1.5;
            transition: color 0.3s;
        }
        
        .event-item:hover .event-info h4 { color: var(--zju-blue); }

        .event-topic {
            font-size: 13px;
            color: var(--zju-gold);
            font-weight: 500;
            margin-bottom: 8px;
            line-height: 1.4;
        }

        .event-speaker {
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 12px;
            line-height: 1.4;
        }

        .btn-sm {
            padding: 6px 18px;
            font-size: 12px;
            border-radius: 20px;
        }

        /* Courses Section */
        .courses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
        }

        .course-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: 16px;
            padding: 35px 30px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-subtle);
        }

        .course-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 4px;
            background: var(--zju-blue);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .course-card:hover {
            transform: translateY(-10px);
            border-color: rgba(0, 63, 135, 0.2);
            box-shadow: 0 20px 40px rgba(0,63,135,0.1);
            background-color: var(--bg-card);
        }

        .course-card:hover::before { opacity: 1; }

        .course-icon {
            width: 64px;
            height: 64px;
            background: var(--bg-light);
            border: 1px solid var(--border-light);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 25px;
            color: var(--zju-blue);
            transition: all 0.3s;
        }
        
        .course-card:hover .course-icon {
            transform: scale(1.1) rotate(5deg);
            border-color: var(--zju-blue);
            background: var(--zju-blue);
            color: white;
        }
        
        .course-card:hover .course-icon svg {
            stroke: white;
        }

        .course-icon svg { stroke: var(--zju-blue); transition: stroke 0.3s; }

        .course-card h3 {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 15px;
            color: var(--text-main);
            line-height: 1.4;
        }

        .course-card p {
            font-size: 14px;
            color: var(--text-muted);
            margin-bottom: 25px;
            line-height: 1.7;
        }

        .course-features {
            list-style: none;
            margin-bottom: 25px;
        }

        .course-features li {
            font-size: 14px;
            color: var(--text-main);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }

        .course-features li::before {
            content: '✦';
            color: var(--zju-gold);
            margin-right: 12px;
            font-size: 12px;
        }

        .course-category { margin-bottom: 70px; }

        .category-title {
            font-size: 22px;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 30px;
            padding-left: 15px;
            border-left: 4px solid var(--zju-blue);
            display: flex;
            align-items: center;
        }

        .course-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 25px 0;
            padding: 15px 20px;
            background: var(--bg-light);
            border: 1px solid var(--border-light);
            border-radius: 8px;
        }

        .course-duration { font-size: 14px; color: var(--text-muted); font-weight: 500; }
        .course-fee { font-size: 15px; font-weight: 600; color: var(--zju-blue); }

        /* ZJU Intro */
        .intro-content {
            display: flex;
            align-items: center;
            gap: 60px;
            flex-wrap: wrap;
            background: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: 20px;
            padding: 40px;
            box-shadow: var(--shadow-subtle);
        }

        .intro-image { flex: 1; min-width: 300px; position: relative; }
        .intro-image::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 12px;
            box-shadow: inset 0 0 30px rgba(0,0,0,0.1);
            pointer-events: none;
        }

        .intro-image img {
            width: 100%;
            border-radius: 12px;
            display: block;
        }

        .intro-text { flex: 1; min-width: 300px; }
        .intro-text h3 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 25px;
            color: var(--zju-blue);
            letter-spacing: 1px;
        }

        .intro-text p {
            font-size: 16px;
            color: var(--text-muted);
            margin-bottom: 20px;
            line-height: 1.8;
        }

        .intro-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 20px;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid var(--border-light);
        }

        .stat-item { text-align: center; }
        .stat-number {
            font-size: 36px;
            font-weight: 800;
            margin-bottom: 5px;
            color: var(--zju-blue);
        }
        .stat-label { font-size: 14px; color: var(--text-muted); font-weight: 500; }

        /* Stories Section */
        .stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
        }

        .stories-card {
            border-radius: 16px;
            box-shadow: var(--shadow-subtle);
            text-align: left;
            transition: all 0.4s;
            position: relative;
            overflow: hidden;
            min-height: 420px;
            display: flex;
            flex-direction: column;
            background: var(--bg-card);
            border: 1px solid var(--border-light);
        }

        .stories-image {
            height: 220px;
            background-size: cover;
            background-position: center;
            position: relative;
        }
        
        .stories-image::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.8));
        }

        .stories-card:nth-child(1) .stories-image { background-image: url('精彩活动2.jpg'); }
        .stories-card:nth-child(2) .stories-image { background-image: url('精彩活动1.jpg'); }
        .stories-card:nth-child(3) .stories-image { background-image: url('精彩活动3.jpg'); }

        .stories-card:hover {
            transform: translateY(-10px);
            border-color: rgba(0,63,135,0.2);
            box-shadow: 0 20px 40px rgba(0,63,135,0.1);
        }

        .stories-content {
            padding: 30px;
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 2;
        }

        .stories-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 8px;
            color: var(--text-main);
        }

        .stories-company {
            font-size: 14px;
            color: var(--zju-blue);
            margin-bottom: 20px;
            font-weight: 500;
        }

        .stories-quote {
            font-size: 15px;
            color: var(--text-muted);
            font-style: italic;
            line-height: 1.8;
            position: relative;
            background: var(--bg-light);
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid var(--zju-gold);
        }

        /* Footer */
        .footer {
            background-color: #001A3A;
            color: rgba(255,255,255,0.8);
            padding: 80px 0 30px;
            border-top: 1px solid #002f66;
        }

        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 50px;
            margin-bottom: 60px;
        }

        .footer-section h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 25px;
            color: white;
            letter-spacing: 1px;
        }

        .footer-section p, .footer-section li {
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 12px;
        }

        .footer-section a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            transition: color 0.3s;
        }

        .footer-section a:hover { color: white; }

        .footer-bottom {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 13px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .nav-links { display: none; }
            .banner { height: 500px; }
            .carousel-content h2 { font-size: 32px; }
            .carousel-content p { font-size: 16px; }
            .section { padding: 60px 0; }
            .section-title h2 { font-size: 28px; }
            .intro-content { padding: 25px; gap: 30px; }
            .month-section { flex: 0 0 90%; }
            .course-card { padding: 25px 20px; }
            .btn { padding: 12px 28px; }
        }

        /* Animation */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .fade-in { opacity: 0; animation: fadeIn 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }`;

const targetPath = '资料夹/zju-entrepreneur-h5.html';
let content = fs.readFileSync(targetPath, 'utf8');

// Replace the style tag content
content = content.replace(/<style>[\s\S]*?<\/style>/, `<style>\n${newStyle}\n    </style>`);

// Write back
fs.writeFileSync(targetPath, content);
console.log('Successfully updated the CSS to match Home.tsx light theme.');
