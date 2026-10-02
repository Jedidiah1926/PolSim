// ===== Hemicycle — 테마 색 모듈 (네온 강조색) =====
// 사용자가 settings.html에서 고른 테마 색(네온 강조색)을 localStorage에 저장하고,
// --tno-neon / --tno-neon-dim 커스텀 프로퍼티로 반영한다. 모드 테마를 쓰는 중이면
// 그 테마의 색을 쓰도록 인라인 오버라이드를 걸지 않는다(thememode.js보다 나중에 로드되어야 함).
// lang.js/uimode.js와 마찬가지로 body가 파싱되기 전에 동기 실행되어야 색이 깜빡이지
// 않으므로, DOMContentLoaded를 기다리지 않고 head에서 바로 적용한다.
(function () {
    'use strict';

    const THEME_KEY = 'dnoThemeColor';
    const DEFAULT_COLOR = '#00ffff';

    function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

    function isValidHex(v) { return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v); }

    function hexToRgb(hex) {
        const m = hex.replace('#', '').match(/.{1,2}/g);
        return m ? m.map(h => parseInt(h, 16)).join(',') : '0,255,255';
    }

    function getThemeColor() {
        const v = safeGet(THEME_KEY);
        return isValidHex(v) ? v : DEFAULT_COLOR;
    }

    // 모드 테마가 켜져 있으면 그 테마의 색을 쓰도록 커스텀 강조색은 걸지 않는다
    function isTnoMode() { return !(window.getThemeMod && window.getThemeMod()); }

    function applyThemeColor(hex) {
        const root = document.documentElement.style;
        if (isTnoMode()) {
            root.setProperty('--tno-neon', hex);
            root.setProperty('--tno-neon-dim', `rgba(${hexToRgb(hex)}, .3)`);
        } else {
            // 모드 테마를 쓰는 중에는 인라인 오버라이드를 제거해 그 테마의 색이 그대로 적용되게 함
            root.removeProperty('--tno-neon');
            root.removeProperty('--tno-neon-dim');
        }
    }

    function setThemeColor(hex) {
        if (!isValidHex(hex)) return;
        safeSet(THEME_KEY, hex);
        applyThemeColor(hex);
    }

    function resetThemeColor() {
        try { localStorage.removeItem(THEME_KEY); } catch (e) {}
        applyThemeColor(DEFAULT_COLOR);
    }

    window.getThemeColor = getThemeColor;
    window.setThemeColor = setThemeColor;
    window.resetThemeColor = resetThemeColor;
    window.getDefaultThemeColor = function () { return DEFAULT_COLOR; };
    window.isValidHexColor = isValidHex;
    // 테마가 바뀔 때(thememode.js) 다시 호출되어 모드 테마 여부에 따라 인라인 오버라이드를 켜고 끔
    window.applyThemeColorForMode = function () { applyThemeColor(getThemeColor()); };

    applyThemeColor(getThemeColor());

    // 다른 탭에서 설정을 바꾼 경우(storage 이벤트)와, 뒤로가기로 bfcache에서 페이지가 복원된
    // 경우(pageshow, persisted) 모두 현재 페이지가 스크립트를 다시 실행하지 않으므로 색이 갱신되지
    // 않는다 — 두 경우 모두 감지해서 최신 색을 다시 적용한다.
    window.addEventListener('storage', function (e) {
        if (e.key === THEME_KEY || e.key === null) applyThemeColor(getThemeColor());
    });
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) applyThemeColor(getThemeColor());
    });
})();
