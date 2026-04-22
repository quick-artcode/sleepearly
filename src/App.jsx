import { useMemo, useState } from "react";

const initialHistory = {
  "2026-04": [1, 2, 4, 6, 8, 10, 13, 16, 18, 21, 22],
  "2026-03": [2, 3, 5, 8, 11, 14, 18, 21, 25, 28],
  "2026-02": [1, 4, 7, 10, 14, 17, 19, 23, 26]
};

const trendData = [
  { day: "一", time: "00:35", height: 78 },
  { day: "二", time: "00:20", height: 66 },
  { day: "三", time: "23:58", height: 52 },
  { day: "四", time: "00:42", height: 84 },
  { day: "五", time: "23:40", height: 38 },
  { day: "六", time: "23:28", height: 28 },
  { day: "日", time: "23:36", height: 34 }
];

const appearanceThemes = {
  default: {
    banner: "me-banner theme-default",
    posterTitle: "默认主题",
    posterText: "清爽的浅色背景，适合日常查看连续打卡与目标时间。"
  },
  imported: {
    banner: "me-banner theme-imported",
    posterTitle: "自定义主题",
    posterText: "使用更有个性的背景样式，让每次打开都更有仪式感。"
  }
};

function App() {
  const [tab, setTab] = useState("plan");
  const [planView, setPlanView] = useState("setup");
  const [meView, setMeView] = useState("home");
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [settings, setSettings] = useState({
    mode: "soothe",
    libraryImported: true,
    duration: 8
  });

  const [appearance, setAppearance] = useState("default");
  const [history, setHistory] = useState(initialHistory);
  const [account, setAccount] = useState({
    loggedIn: false,
    name: "",
    identifier: "",
    password: ""
  });

  const posterTheme = appearanceThemes[appearance];
  const checkCount = useMemo(
    () => Object.values(history).reduce((sum, days) => sum + days.length, 0),
    [history]
  );

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 1800);
  }

  function goTab(nextTab) {
    setTab(nextTab);
    if (nextTab === "plan") {
      setPlanView("setup");
    }
    if (nextTab === "me") {
      setMeView("home");
      setShareOpen(false);
    }
  }

  function handlePlanStart() {
    setPlanView(settings.mode === "soothe" ? "whiteNoise" : "lock");
    showToast(settings.mode === "soothe" ? "已进入哄睡模式" : "已进入强制锁屏模式");
  }

  return (
    <div className="page">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <div className="phone">
        <header className="topbar">
          <div className="notch" />
          <span>9:30</span>
          <span>100%</span>
        </header>

        <main className="screen">
          {tab === "plan" && (
            <PlanScreen
              settings={settings}
              planView={planView}
              onModeChange={(mode) => setSettings((prev) => ({ ...prev, mode }))}
              onStart={handlePlanStart}
              onBack={() => setPlanView("setup")}
            />
          )}
          {tab === "stats" && <StatsScreen checkCount={checkCount} />}
          {tab === "me" && (
            <MeScreen
              view={meView}
              shareOpen={shareOpen}
              account={account}
              settings={settings}
              appearance={appearance}
              history={history}
              posterTheme={posterTheme}
              onOpenView={setMeView}
              onOpenShare={() => setShareOpen(true)}
              onCloseShare={() => setShareOpen(false)}
              onAccountChange={setAccount}
              onSettingsChange={setSettings}
              onAppearanceChange={setAppearance}
              onHistoryToggle={(monthKey, day) =>
                setHistory((prev) => {
                  const existing = prev[monthKey] || [];
                  const nextDays = existing.includes(day)
                    ? existing.filter((item) => item !== day)
                    : [...existing, day].sort((a, b) => a - b);

                  return {
                    ...prev,
                    [monthKey]: nextDays
                  };
                })
              }
              onSuccess={showToast}
            />
          )}
        </main>

        <nav className="tabbar">
          <TabButton active={tab === "plan"} label="计划" icon="◧" onClick={() => goTab("plan")} />
          <TabButton active={tab === "stats"} label="统计" icon="◫" onClick={() => goTab("stats")} />
          <TabButton active={tab === "me"} label="我的" icon="◎" onClick={() => goTab("me")} />
        </nav>

        {toast ? <div className="toast">{toast}</div> : null}
      </div>
    </div>
  );
}

function PlanScreen({ settings, planView, onModeChange, onStart, onBack }) {
  if (planView === "whiteNoise") {
    return <WhiteNoiseScreen onBack={onBack} />;
  }

  if (planView === "lock") {
    return <LockScreen onBack={onBack} />;
  }

  const planSteps = [
    { label: "洗漱完成", value: true },
    { label: "手机远离床边", value: settings.mode === "force" },
    { label: "进入轻提醒模式", value: true }
  ];

  return (
    <>
      <section className="hero">
        <p className="eyebrow">今晚计划</p>
        <h1>23:00 前慢慢进入睡眠状态</h1>
        <p className="subtle">不用一下子变得特别自律，只要先把今晚的几个动作完成就好。</p>
      </section>

      <section className="panel panel-accent">
        <div className="section-row">
          <span className="label">目标入睡时间</span>
          <span className="badge">今日目标</span>
        </div>
        <div className="time-box">
          <div>
            <strong>22</strong>
            <small>时</small>
          </div>
          <div className="colon">:</div>
          <div>
            <strong>30</strong>
            <small>分</small>
          </div>
        </div>
      </section>

      <section className="section-title">选择今晚的干预方式</section>
      <section className="mode-grid">
        <button
          className={`mode-card ${settings.mode === "soothe" ? "active" : ""}`}
          onClick={() => onModeChange("soothe")}
        >
          <strong>哄睡优先</strong>
          <span>进入白噪音与轻陪伴流程，帮助自己更自然地放下手机。</span>
        </button>
        <button
          className={`mode-card ${settings.mode === "force" ? "active" : ""}`}
          onClick={() => onModeChange("force")}
        >
          <strong>强制优先</strong>
          <span>进入锁屏干预流程，减少继续刷手机和拖延的空间。</span>
        </button>
      </section>

      <section className="panel compact">
        <div className="section-row">
          <span className="label">提醒策略</span>
          <span className="badge">{settings.libraryImported ? "轻提醒" : "基础提醒"}</span>
        </div>
        <p className="muted">22:00 开始提醒，22:15 推送第一步动作，22:30 自动进入对应干预页。</p>
      </section>

      <section className="panel compact">
        <div className="section-row">
          <span className="label">今晚待完成</span>
          <span className="badge soft">进行中</span>
        </div>
        <div className="step-list">
          {planSteps.map((step) => (
            <div key={step.label} className="step-item">
              <span className={`step-dot ${step.value ? "done" : ""}`} />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </section>

      <button className="primary-btn" onClick={onStart}>
        保存并启动
      </button>
    </>
  );
}

function WhiteNoiseScreen({ onBack }) {
  const [playing, setPlaying] = useState(true);
  const [timer, setTimer] = useState(20);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">哄睡模式</p>
        <h1>白噪音正在播放</h1>
        <p className="subtle">让注意力慢慢离开信息流，用更轻的声音陪你进入休息节奏。</p>
      </section>

      <section className="player-card">
        <div className={`player-disc ${playing ? "spinning" : ""}`}>
          <div className="player-core" />
        </div>
        <strong>海边晚风</strong>
        <p className="muted">预计播放 {timer} 分钟，屏幕会保持较暗亮度。</p>
      </section>

      <section className="panel compact">
        <div className="info-row">
          <span>当前音量</span>
          <strong>35%</strong>
        </div>
        <div className="info-row">
          <span>定时关闭</span>
          <strong>{timer} 分钟</strong>
        </div>
        <div className="info-row">
          <span>辅助模式</span>
          <strong>呼吸引导</strong>
        </div>
      </section>

      <div className="control-row">
        <button className="ghost-btn" onClick={() => setPlaying((prev) => !prev)}>
          {playing ? "暂停" : "继续"}
        </button>
        <button className="primary-btn" onClick={() => setTimer((prev) => (prev === 20 ? 30 : 20))}>
          切换定时
        </button>
      </div>

      <button className="text-btn" onClick={onBack}>
        返回计划设置
      </button>
    </>
  );
}

function LockScreen({ onBack }) {
  const [countdown, setCountdown] = useState(30);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">强制模式</p>
        <h1>手机已进入锁屏干预</h1>
        <p className="subtle">先帮自己把高刺激内容隔开，只留下闹钟和紧急联系。</p>
      </section>

      <section className="lock-card">
        <div className="lock-time">22:30</div>
        <div className="lock-icon">🔒</div>
        <p>晚安模式已开启</p>
        <small>短视频、社交、游戏类应用已暂时不可用</small>
      </section>

      <section className="panel compact">
        <div className="info-row">
          <span>解锁方式</span>
          <strong>等待 {countdown} 分钟</strong>
        </div>
        <div className="info-row">
          <span>例外应用</span>
          <strong>电话 / 闹钟</strong>
        </div>
        <div className="info-row">
          <span>强制等级</span>
          <strong>高</strong>
        </div>
      </section>

      <div className="control-row">
        <button className="ghost-btn" onClick={() => setCountdown((prev) => Math.max(5, prev - 5))}>
          缩短 5 分钟
        </button>
        <button className="primary-btn" onClick={() => setCountdown((prev) => prev + 5)}>
          延长 5 分钟
        </button>
      </div>

      <button className="text-btn" onClick={onBack}>
        返回计划设置
      </button>
    </>
  );
}

function StatsScreen({ checkCount }) {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">睡眠趋势</p>
        <h1>这周的状态正在慢慢稳定</h1>
        <p className="subtle">保持一点点提前入睡，就已经是在往更舒服的作息靠近了。</p>
      </section>

      <section className="stats-grid">
        <div className="metric-card">
          <strong>24 分钟</strong>
          <span>平均提前入睡</span>
        </div>
        <div className="metric-card">
          <strong>{checkCount} 次</strong>
          <span>累计打卡</span>
        </div>
      </section>

      <section className="panel">
        <div className="section-row">
          <span className="label">本周入睡时间</span>
          <span className="badge">近 7 天</span>
        </div>
        <div className="chart">
          {trendData.map((item, index) => (
            <div className="bar-item" key={item.day}>
              <div className={`bar ${index >= 4 ? "good" : ""}`} style={{ height: `${item.height}%` }} />
              <small>{item.day}</small>
              <small className="muted">{item.time}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel compact">
        <span className="label">本周建议</span>
        <p className="muted">周四更容易拖晚，可以把任务简化成“洗漱 + 手机远离床边”，降低启动压力。</p>
      </section>
    </>
  );
}

function MeScreen({
  view,
  shareOpen,
  account,
  settings,
  appearance,
  history,
  posterTheme,
  onOpenView,
  onOpenShare,
  onCloseShare,
  onAccountChange,
  onSettingsChange,
  onAppearanceChange,
  onHistoryToggle,
  onSuccess
}) {
  if (view === "login") {
    return (
      <LoginView
        account={account}
        onBack={() => onOpenView("home")}
        onChange={onAccountChange}
        onSubmit={(type) => {
          const identifier = account.identifier.trim();
          if (!identifier) {
            onSuccess("请先输入账号");
            return;
          }

          onAccountChange((prev) => ({
            ...prev,
            loggedIn: true,
            name: identifier.includes("@") ? identifier.split("@")[0] : identifier.slice(-4)
          }));
          onOpenView("home");
          onSuccess(type === "register" ? "注册成功，已自动登录" : "登录成功");
        }}
      />
    );
  }

  if (view === "settings") {
    return (
      <SettingsView
        settings={settings}
        onBack={() => onOpenView("home")}
        onChange={onSettingsChange}
        onShare={onOpenShare}
      />
    );
  }

  if (view === "appearance") {
    return (
      <AppearanceView
        appearance={appearance}
        posterTheme={posterTheme}
        onBack={() => onOpenView("home")}
        onChange={(value) => {
          onAppearanceChange(value);
          onSuccess("外观已更新");
        }}
      />
    );
  }

  if (view === "history") {
    return <MonthlyHistoryView history={history} onBack={() => onOpenView("home")} onToggle={onHistoryToggle} />;
  }

  return (
    <>
      <section className="me-home">
        <div className="me-banner-card">
          <button className={posterTheme.banner} onClick={() => onOpenView("login")}>
            <div className="me-avatar">
              <div className="me-avatar-face" />
              <div className="me-avatar-glow" />
            </div>
            <div className="me-banner-copy">
              <span className="me-banner-tag">{account.loggedIn ? `${account.name} 已登录` : "未登录"}</span>
              <small>{account.loggedIn ? "查看账号信息与同步状态" : "点击登录并同步数据"}</small>
            </div>
          </button>
        </div>

        <section className="me-card">
          <ActionRow label="设置" icon="gear" onClick={() => onOpenView("settings")} />
          <ActionRow label="海报背景与外观" icon="poster" onClick={() => onOpenView("appearance")} />
          <ActionRow label="历史数据" icon="history" onClick={() => onOpenView("history")} />
        </section>

        <section className="me-card single">
          <ActionRow label="分享给朋友们" icon="share" onClick={onOpenShare} />
        </section>
      </section>

      {shareOpen ? <ShareSheet onClose={onCloseShare} /> : null}
    </>
  );
}

function LoginView({ account, onBack, onChange, onSubmit }) {
  return (
    <>
      <SubHeader title="登录" onBack={onBack} />

      <section className="login-hero-card">
        <div className="login-hero-art">
          <div className="login-moon" />
          <div className="login-cloud cloud-left" />
          <div className="login-cloud cloud-right" />
          <div className="login-bed" />
        </div>
        <div className="login-hero-copy">
          <strong>今晚开始，慢慢早睡</strong>
          <p className="muted">登录后同步你的目标时间、睡前模式和历史记录。</p>
        </div>
      </section>

      <section className="me-intro-card">
        <strong>同步你的早睡计划</strong>
        <p className="muted">登录后可保存目标时间、白噪音偏好和历史打卡记录。</p>
      </section>

      <section className="panel me-panel">
        <span className="label">手机号 / 邮箱</span>
        <input
          className="input"
          placeholder="请输入手机号或邮箱"
          value={account.identifier}
          onChange={(event) => onChange((prev) => ({ ...prev, identifier: event.target.value }))}
        />
      </section>

      <section className="panel me-panel">
        <span className="label">密码</span>
        <input
          className="input"
          type="password"
          placeholder="请输入密码"
          value={account.password}
          onChange={(event) => onChange((prev) => ({ ...prev, password: event.target.value }))}
        />
      </section>

      <div className="control-row">
        <button className="ghost-btn" onClick={() => onSubmit("register")}>
          注册
        </button>
        <button className="primary-btn" onClick={() => onSubmit("login")}>
          登录
        </button>
      </div>
    </>
  );
}

function SettingsView({ settings, onBack, onChange, onShare }) {
  return (
    <>
      <SubHeader title="设置" onBack={onBack} />

      <section className="me-intro-card">
        <strong>睡前干预偏好</strong>
        <p className="muted">在这里调整默认模式、轻音资源和每日预期睡眠时长。</p>
      </section>

      <section className="me-card detail-card">
        <ChoiceRow
          label="默认模式"
          description={settings.mode === "soothe" ? "哄睡模式" : "强制模式"}
          icon="moon"
          checked={settings.mode === "soothe"}
          onClick={() => onChange((prev) => ({ ...prev, mode: prev.mode === "soothe" ? "force" : "soothe" }))}
        />
        <ChoiceRow
          label="轻音库导入"
          description={settings.libraryImported ? "已启用" : "未启用"}
          icon="music"
          checked={settings.libraryImported}
          onClick={() => onChange((prev) => ({ ...prev, libraryImported: !prev.libraryImported }))}
        />
        <div className="detail-row detail-range">
          <span className="detail-icon icon-sleep" />
          <div className="detail-main">
            <span className="detail-label">默认睡眠时长</span>
            <div className="duration-box">
              <button className="mini-btn" onClick={() => onChange((prev) => ({ ...prev, duration: Math.max(1, prev.duration - 1) }))}>
                -
              </button>
              <strong>{settings.duration}</strong>
              <button className="mini-btn" onClick={() => onChange((prev) => ({ ...prev, duration: Math.min(12, prev.duration + 1) }))}>
                +
              </button>
              <span>小时</span>
            </div>
          </div>
        </div>
      </section>

      <section className="me-card single">
        <ActionRow label="分享给朋友们" icon="share" onClick={onShare} />
      </section>
    </>
  );
}

function AppearanceView({ appearance, posterTheme, onBack, onChange }) {
  return (
    <>
      <SubHeader title="海报背景与外观" onBack={onBack} />

      <section className="me-intro-card">
        <strong>个性化外观</strong>
        <p className="muted">挑一个更喜欢的主题，让每次打开都有更舒服的氛围。</p>
      </section>

      <section className="poster-preview-card">
        <div className={`${posterTheme.banner} preview-banner`} />
        <strong>{posterTheme.posterTitle}</strong>
        <p className="muted">{posterTheme.posterText}</p>
      </section>

      <section className="me-card detail-card">
        <ChoiceRow
          label="默认主题"
          description="使用系统默认背景"
          checked={appearance === "default"}
          onClick={() => onChange("default")}
        />
        <ChoiceRow
          label="自定义主题"
          description="使用更有风格的背景"
          checked={appearance === "imported"}
          onClick={() => onChange("imported")}
        />
      </section>
    </>
  );
}

function MonthlyHistoryView({ history, onBack, onToggle }) {
  const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];
  const [monthDate, setMonthDate] = useState(new Date(2026, 3, 1));

  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
  const completedDays = history[monthKey] || [];
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, index) =>
    index < startOffset ? null : index - startOffset + 1
  );

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <>
      <SubHeader title="历史数据" onBack={onBack} />

      <section className="me-intro-card">
        <strong>{monthDate.getFullYear()} 年 {monthDate.getMonth() + 1} 月睡眠表现</strong>
        <p className="muted">点击某一天可以切换是否达标，整个月的节奏会一目了然。</p>
      </section>

      <section className="me-card detail-card">
        <div className="calendar-toolbar">
          <button className="mini-nav-btn" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}>
            ←
          </button>
          <strong>{monthDate.getFullYear()} / {String(monthDate.getMonth() + 1).padStart(2, "0")}</strong>
          <button className="mini-nav-btn" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}>
            →
          </button>
        </div>

        <table className="history-table">
          <thead>
            <tr>
              {weekdayLabels.map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((row, rowIndex) => (
              <tr key={`${monthKey}-${rowIndex}`}>
                {row.map((day, cellIndex) => (
                  <td key={`${monthKey}-${rowIndex}-${cellIndex}`} className={!day ? "empty-cell" : ""}>
                    {day ? (
                      <button className={`history-cell ${completedDays.includes(day) ? "checked" : ""}`} onClick={() => onToggle(monthKey, day)}>
                        <span>{day}</span>
                        {completedDays.includes(day) ? <em>✓</em> : null}
                      </button>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function ShareSheet({ onClose }) {
  const [selected, setSelected] = useState("微信");

  return (
    <div className="share-sheet">
      <div className="share-sheet-handle" />
      <h3>分享给朋友们</h3>
      <p className="muted">把你的早睡计划、连续打卡和睡前干预体验分享出去。</p>
      <div className="share-grid">
        {["微信", "朋友圈", "复制链接"].map((item) => (
          <button
            key={item}
            className={`ghost-btn ${selected === item ? "share-selected" : ""}`}
            onClick={() => setSelected(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <button className="primary-btn share-primary" onClick={onClose}>
        使用 {selected} 分享
      </button>
      <button className="text-btn" onClick={onClose}>
        关闭
      </button>
    </div>
  );
}

function SubHeader({ title, onBack }) {
  return (
    <header className="sub-header">
      <button className="back-btn" onClick={onBack}>
        ←
      </button>
      <h2>{title}</h2>
    </header>
  );
}

function ActionRow({ label, icon = "dot", onClick }) {
  return (
    <button className="action-row" onClick={onClick}>
      <span className={`action-icon icon-${icon}`} />
      <span className="action-label">{label}</span>
    </button>
  );
}

function ChoiceRow({ label, description, icon = "dot", checked, onClick }) {
  return (
    <button className="detail-row choice-row" onClick={onClick}>
      <span className={`detail-icon icon-${icon}`} />
      <div className="detail-main">
        <div className="detail-copy">
          <span className="detail-label">{label}</span>
          <span className="detail-helper">{description}</span>
        </div>
        <span className={`radio ${checked ? "checked" : ""}`} />
      </div>
    </button>
  );
}

function TabButton({ active, icon, label, onClick }) {
  return (
    <button className={`tab-btn ${active ? "active" : ""}`} onClick={onClick}>
      <span>{icon}</span>
      <small>{label}</small>
    </button>
  );
}

export default App;
