const fs = require('fs');

const newStyle = `        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-dark: #050B14;
            --bg-card: #0A1325;
            --bg-card-hover: #121E36;
            --zju-blue: #003F87;
            --zju-light-blue: #0052b3;
            --zju-gold: #D4AF37;
            --zju-gold-hover: #F2D06B;
            --text-main: #F8FAFC;
            --text-muted: #94A3B8;
            --border-light: rgba(255, 255, 255, 0.08);
            --shadow-subtle: 0 4px 20px rgba(0, 0, 0, 0.3);
            --shadow-glow: 0 0 20px rgba(0, 63, 135, 0.5);
        }

        body {
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: var(--text-main);
            background-color: var(--bg-dark);
            background-image: 
                radial-gradient(circle at 15% 50%, rgba(0, 63, 135, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 85% 30%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
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
            background-color: rgba(5, 11, 20, 0.85);
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
            color: var(--text-main);
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
            background-color: var(--zju-gold);
            transition: width 0.3s;
        }

        .nav-links a:hover {
            color: var(--zju-gold);
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
            background-color: var(--bg-dark);
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
            background: linear-gradient(to right, rgba(5,11,20,0.9) 0%, rgba(5,11,20,0.6) 50%, rgba(5,11,20,0.8) 100%);
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
            text-shadow: 0 4px 12px rgba(0,0,0,0.5);
            background: linear-gradient(to right, #fff, #cbd5e1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .carousel-content p {
            font-size: 20px;
            margin-bottom: 40px;
            color: #e2e8f0;
            font-weight: 300;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .btn {
            display: inline-block;
            padding: 14px 36px;
            background: linear-gradient(135deg, var(--zju-blue), var(--zju-light-blue));
            color: #fff;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 63, 135, 0.4);
        }

        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 63, 135, 0.6);
            background: linear-gradient(135deg, var(--zju-light-blue), #0066cc);
        }

        .btn-secondary {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.3);
            margin-left: 20px;
            backdrop-filter: blur(4px);
            box-shadow: none;
        }

        .btn-secondary:hover {
            background: rgba(212, 175, 55, 0.1);
            border-color: var(--zju-gold);
            color: var(--zju-gold);
            box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
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
            background-color: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.4s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .indicator.active {
            background-color: var(--zju-gold);
            width: 32px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
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
            background: linear-gradient(90deg, transparent, var(--zju-gold), transparent);
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
            background: linear-gradient(90deg, var(--bg-card-hover), var(--bg-card));
            border: 1px solid var(--border-light);
            border-bottom: none;
            color: var(--zju-gold);
            padding: 15px 20px;
            border-radius: 12px 12px 0 0;
        }

        .month-title h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
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
            border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .event-item:last-child { border-bottom: none; }

        .event-item:hover {
            background-color: rgba(255,255,255,0.02);
            border-left-color: var(--zju-gold);
        }

        .event-date-badge {
            width: 75px;
            height: 75px;
            background: linear-gradient(135deg, #1e293b, #0f172a);
            border: 1px solid var(--border-light);
            color: var(--zju-gold);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            text-align: center;
            margin-right: 20px;
            flex-shrink: 0;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
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
        
        .event-item:hover .event-info h4 { color: var(--zju-gold); }

        .event-topic {
            font-size: 13px;
            color: var(--text-muted);
            font-weight: 500;
            margin-bottom: 8px;
            line-height: 1.4;
        }

        .event-speaker {
            font-size: 13px;
            color: #64748b;
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
        }

        .course-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 4px;
            background: linear-gradient(90deg, var(--zju-blue), var(--zju-gold));
            opacity: 0;
            transition: opacity 0.3s;
        }

        .course-card:hover {
            transform: translateY(-10px);
            border-color: rgba(212, 175, 55, 0.3);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            background-color: var(--bg-card-hover);
        }

        .course-card:hover::before { opacity: 1; }

        .course-icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, rgba(0,63,135,0.2), rgba(212,175,55,0.1));
            border: 1px solid rgba(212,175,55,0.2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 25px;
            color: var(--zju-gold);
            transition: all 0.3s;
        }
        
        .course-card:hover .course-icon {
            transform: scale(1.1) rotate(5deg);
            border-color: var(--zju-gold);
            box-shadow: 0 0 15px rgba(212,175,55,0.3);
        }

        .course-icon svg { stroke: var(--zju-gold); }

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
            color: #cbd5e1;
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
            border-left: 4px solid var(--zju-gold);
            display: flex;
            align-items: center;
        }

        .course-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 25px 0;
            padding: 15px 20px;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 8px;
        }

        .course-duration { font-size: 14px; color: var(--text-muted); }
        .course-fee { font-size: 15px; font-weight: 600; color: var(--zju-gold); }

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
            box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
            pointer-events: none;
        }

        .intro-image img {
            width: 100%;
            border-radius: 12px;
            display: block;
            filter: brightness(0.85) contrast(1.1);
        }

        .intro-text { flex: 1; min-width: 300px; }
        .intro-text h3 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 25px;
            color: var(--text-main);
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
            background: linear-gradient(135deg, #fff, #64748b);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        .stat-label { font-size: 14px; color: var(--zju-gold); font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }

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
            background: linear-gradient(to bottom, transparent, var(--bg-card));
        }

        .stories-card:nth-child(1) .stories-image { background-image: url('精彩活动2.jpg'); }
        .stories-card:nth-child(2) .stories-image { background-image: url('精彩活动1.jpg'); }
        .stories-card:nth-child(3) .stories-image { background-image: url('精彩活动3.jpg'); }

        .stories-card:hover {
            transform: translateY(-10px);
            border-color: rgba(255,255,255,0.15);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
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
            color: var(--zju-gold);
            margin-bottom: 20px;
            font-weight: 500;
        }

        .stories-quote {
            font-size: 15px;
            color: var(--text-muted);
            font-style: italic;
            line-height: 1.8;
            position: relative;
        }
        
        .stories-quote::before {
            content: '"';
            font-size: 40px;
            color: rgba(212,175,55,0.2);
            position: absolute;
            top: -15px;
            left: -15px;
            font-family: serif;
        }

        /* Footer */
        .footer {
            background-color: #020617;
            color: var(--text-muted);
            padding: 80px 0 30px;
            border-top: 1px solid rgba(255,255,255,0.05);
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
            color: var(--text-main);
            letter-spacing: 1px;
        }

        .footer-section p, .footer-section li {
            font-size: 14px;
            line-height: 1.8;
            margin-bottom: 12px;
            color: #94a3b8;
        }

        .footer-section a {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.3s;
        }

        .footer-section a:hover { color: var(--zju-gold); }

        .footer-bottom {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 13px;
            color: #64748b;
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
console.log('Successfully updated the CSS of the HTML file.');
