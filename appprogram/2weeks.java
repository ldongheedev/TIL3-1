<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>이동희 | 개발자 포트폴리오</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Noto+Sans+KR:wght@300;400;600;700&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --primary: #2563eb;
      --primary-light: #eff6ff;
      --text: #111827;
      --sub: #6b7280;
      --border: #e5e7eb;
      --bg: #ffffff;
      --bg2: #f9fafb;
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', 'Noto Sans KR', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }

    /* NAV */
    nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
      padding: 0 60px;
      height: 60px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo { font-weight: 800; font-size: 1rem; letter-spacing: 2px; color: var(--text); }
    nav ul { list-style: none; display: flex; gap: 32px; }
    nav ul a { text-decoration: none; font-size: 0.88rem; color: var(--sub); font-weight: 500; transition: color .2s; }
    nav ul a:hover { color: var(--primary); }

    /* HERO */
    #hero-introduction {
      min-height: 92vh;
      display: flex; flex-direction: column; justify-content: center;
      padding: 80px 60px;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
    }
    .hero-tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--primary-light);
      color: var(--primary);
      font-size: 0.8rem; font-weight: 600;
      padding: 6px 14px; border-radius: 999px;
      width: fit-content; margin-bottom: 24px;
    }
    .hero-tag::before { content: ''; width: 6px; height: 6px; background: var(--primary); border-radius: 50%; }
    #hero-introduction h1 {
      font-size: clamp(2.8rem, 6vw, 5rem);
      font-weight: 800; line-height: 1.15;
      color: var(--text); margin-bottom: 20px;
    }
    #hero-introduction h1 span { color: var(--primary); }
    #hero-introduction p { font-size: 1.05rem; color: var(--sub); max-width: 480px; margin-bottom: 36px; line-height: 1.8; }
    .hero-btns { display: flex; gap: 12px; }
    .btn {
      padding: 12px 28px; border-radius: 8px;
      font-size: 0.92rem; font-weight: 600;
      text-decoration: none; border: none; cursor: pointer;
      transition: all .2s;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
    .btn-outline { background: #fff; color: var(--text); border: 1.5px solid var(--border); }
    .btn-outline:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-1px); }

    /* SECTION COMMON */
    section { padding: 96px 60px; }
    .section-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 3px; color: var(--primary); text-transform: uppercase; margin-bottom: 12px; }
    .section-title { font-size: 2rem; font-weight: 800; color: var(--text); margin-bottom: 48px; }

    /* SKILLS */
    #tech-skills { background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .skill-card {
      background: #fff; border: 1px solid var(--border);
      border-radius: 12px; padding: 20px 24px;
      transition: box-shadow .2s, transform .2s;
    }
    .skill-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }
    .skill-name { font-weight: 700; font-size: 0.95rem; margin-bottom: 12px; color: var(--text); }
    .skill-meta { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--sub); margin-bottom: 8px; }
    .skill-bar { background: #e5e7eb; border-radius: 99px; height: 6px; }
    .skill-bar-fill { background: var(--primary); height: 6px; border-radius: 99px; transition: width 1s ease; }

    /* PROJECTS */
    #projects { background: var(--bg); }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .project-card {
      border: 1px solid var(--border); border-radius: 16px;
      padding: 32px; background: #fff;
      display: flex; flex-direction: column; gap: 14px;
      transition: box-shadow .2s, transform .2s;
    }
    .project-card:hover { box-shadow: 0 8px 32px rgba(37,99,235,0.08); transform: translateY(-3px); }
    .project-icon { font-size: 2rem; }
    .project-card h3 { font-size: 1.15rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 10px; }
    .project-card p { font-size: 0.9rem; color: var(--sub); line-height: 1.7; flex: 1; }
    .tech-tags { display: flex; flex-wrap: wrap; gap: 7px; }
    .tech-tag {
      background: var(--primary-light); color: var(--primary);
      font-size: 0.75rem; font-weight: 600;
      padding: 4px 10px; border-radius: 999px;
    }
    .badge-upcoming {
      background: #fef9c3; color: #854d0e;
      font-size: 0.72rem; font-weight: 600;
      padding: 3px 9px; border-radius: 999px;
    }

    /* EDUCATION */
    #education { background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .edu-card {
      background: #fff; border: 1px solid var(--border);
      border-radius: 12px; padding: 28px 32px;
      max-width: 480px;
      display: flex; align-items: center; gap: 20px;
    }
    .edu-icon { font-size: 2.2rem; }
    .edu-school { font-size: 1.1rem; font-weight: 700; color: var(--text); }
    .edu-dept { font-size: 0.92rem; color: var(--primary); font-weight: 600; margin-top: 4px; }
    .edu-period { font-size: 0.82rem; color: var(--sub); margin-top: 4px; }

    /* CONTACT */
    #contact-information { background: var(--text); }
    #contact-information .section-label { color: #60a5fa; }
    #contact-information .section-title { color: #fff; }
    #contact-information p { color: #9ca3af; margin-top: -32px; margin-bottom: 40px; font-size: 0.95rem; }
    .contact-links { display: flex; gap: 12px; flex-wrap: wrap; }
    .contact-link {
      display: inline-flex; align-items: center; gap: 8px;
      background: #1f2937; color: #e5e7eb;
      padding: 12px 24px; border-radius: 8px;
      text-decoration: none; font-size: 0.9rem; font-weight: 600;
      border: 1px solid #374151;
      transition: all .2s;
    }
    .contact-link:hover { background: var(--primary); border-color: var(--primary); color: #fff; }

    footer { background: #0f172a; color: #4b5563; text-align: center; padding: 24px; font-size: 0.82rem; }

    @media (max-width: 640px) {
      nav { padding: 0 20px; }
      section { padding: 64px 24px; }
      #hero-introduction { padding: 64px 24px; }
      #hero-introduction h1 { font-size: 2.4rem; }
    }
  </style>
</head>
<body>

  <nav id="navbar">
    <div class="logo">LEE DONGHEE</div>
    <ul>
      <li><a href="#hero-introduction">소개</a></li>
      <li><a href="#tech-skills">기술</a></li>
      <li><a href="#projects">프로젝트</a></li>
      <li><a href="#education">학력</a></li>
      <li><a href="#contact-information">연락처</a></li>
    </ul>
  </nav>

  <!-- HERO -->
  <section id="hero-introduction">
    <div class="hero-tag">Junior Developer</div>
    <h1>안녕하세요,<br><span>이동희</span>입니다.</h1>
    <p>웹 서비스 개발에 열정을 가진 개발자입니다.<br>사람들의 일상을 더 편리하게 만드는 서비스를 만들고 싶습니다.</p>
    <div class="hero-btns">
      <a href="#projects" class="btn btn-primary">프로젝트 보기</a>
      <a href="#contact-information" class="btn btn-outline">연락하기</a>
    </div>
  </section>

  <!-- SKILLS -->
  <section id="tech-skills">
    <div class="section-label">Skills</div>
    <div class="section-title">기술 스택</div>
    <div class="skills-grid">
      <div class="skill-card">
        <div class="skill-name">Python</div>
        <div class="skill-meta"><span>중급</span><span>60%</span></div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:60%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-name">Java</div>
        <div class="skill-meta"><span>중급</span><span>60%</span></div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:60%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-name">JavaScript</div>
        <div class="skill-meta"><span>중급</span><span>60%</span></div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:60%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-name">React</div>
        <div class="skill-meta"><span>사용 경험</span><span>45%</span></div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:45%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-name">Spring Boot</div>
        <div class="skill-meta"><span>사용 경험</span><span>45%</span></div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:45%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-name">MariaDB / PostgreSQL</div>
        <div class="skill-meta"><span>사용 경험</span><span>45%</span></div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:45%"></div></div>
      </div>
    </div>
  </section>

  <!-- PROJECTS -->
  <section id="projects">
    <div class="section-label">Projects</div>
    <div class="section-title">대표 프로젝트</div>
    <div class="projects-grid">

      <div id="project-junggomoah" class="project-card">
        <div class="project-icon">📦</div>
        <h3>중고모아</h3>
        <p>중고 거래를 위한 웹 사이트 개발 프로젝트. 사용자가 중고 물품을 등록하고 거래할 수 있는 플랫폼입니다.</p>
        <div class="tech-tags">
          <span class="tech-tag">JSP</span>
          <span class="tech-tag">MariaDB</span>
          <span class="tech-tag">Apache Tomcat</span>
        </div>
      </div>

      <div id="project-flatmap" class="project-card">
        <div class="project-icon">🗺️</div>
        <h3>flatmap</h3>
        <p>오르막길을 피해 평탄한 경로를 안내해 주는 지도 웹 서비스. 보행 약자나 자전거 이용자를 위한 경로 추천 플랫폼입니다.</p>
        <div class="tech-tags">
          <span class="tech-tag">Java</span>
          <span class="tech-tag">React</span>
          <span class="tech-tag">PostgreSQL</span>
        </div>
      </div>

      <div id="project-safetyroad" class="project-card">
        <div class="project-icon">🌙</div>
        <h3>Safety Road <span class="badge-upcoming">개발 예정</span></h3>
        <p>야간 보행 시 안전한 경로를 안내하는 지도 서비스. 가로등·CCTV 데이터를 기반으로 안전도가 높은 길을 추천합니다.</p>
        <div class="tech-tags">
          <span class="tech-tag">Spring Boot</span>
          <span class="tech-tag">PostgreSQL</span>
          <span class="tech-tag">React</span>
        </div>
      </div>

    </div>
  </section>

  <!-- EDUCATION -->
  <section id="education">
    <div class="section-label">Education</div>
    <div class="section-title">학력</div>
    <div class="edu-card">
      <div class="edu-icon">🎓</div>
      <div>
        <div class="edu-school">신구대학교</div>
        <div class="edu-dept">컴퓨터소프트웨어과</div>
        <div class="edu-period">재학 중</div>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section id="contact-information">
    <div class="section-label">Contact</div>
    <div class="section-title">연락처</div>
    <p>새로운 기회나 협업 제안은 언제든지 환영합니다 😊</p>
    <div class="contact-links">
      <a href="mailto:" class="contact-link">📧 이메일 문의</a>
      <a href="#" class="contact-link">🐙 GitHub</a>
    </div>
  </section>

  <footer id="footer">
    © 2026 이동희 · All rights reserved.
  </footer>

</body>
</html>