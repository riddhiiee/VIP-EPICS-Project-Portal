document.addEventListener("DOMContentLoaded", () => {

    // Floating bubble
    const bubble = document.createElement("div");
    bubble.innerHTML = "💬";
    Object.assign(bubble.style, {
        position: "fixed",
        bottom: "22px",
        right: "22px",
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
        color: "#fff",
        fontSize: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 99999,
        boxShadow: "0 12px 35px rgba(59,130,246,0.45)",
        transition: "0.25s"
    });
    bubble.onmouseenter = () => bubble.style.transform = "scale(1.12)";
    bubble.onmouseleave = () => bubble.style.transform = "scale(1)";
    document.body.appendChild(bubble);

    // Chatbox
    const box = document.createElement("div");
    Object.assign(box.style, {
        position: "fixed",
        bottom: "100px",
        right: "22px",
        width: "380px",
        maxHeight: "520px",
        background: "rgba(240,248,255,0.65)", // light bluish-white
        backdropFilter: "blur(18px) saturate(180%)",
        WebkitBackdropFilter: "blur(18px) saturate(180%)",
        color: "#1e3a8a", // dark blue text
        borderRadius: "20px",
        border: "1px solid rgba(59,130,246,0.3)",
        display: "none",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 99999,
        boxShadow: "0 12px 35px rgba(59,130,246,0.3)"
    });
    document.body.appendChild(box);

    // Header
    const head = document.createElement("div");
    head.innerHTML = "Admin Chatbot";
    Object.assign(head.style, {
        padding: "14px",
        background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
        fontWeight: "650",
        fontSize: "18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        letterSpacing: "0.4px",
        color: "#fff"
    });

    const close = document.createElement("span");
    close.innerHTML = "✖";
    Object.assign(close.style, {
        cursor: "pointer",
        color: "#e0f2fe",
        fontSize: "16px",
        transition: ".2s"
    });
    close.onmouseenter = () => close.style.color = "#3b82f6";
    close.onmouseleave = () => close.style.color = "#e0f2fe";
    close.onclick = () => box.style.display = "none";

    head.appendChild(close);
    box.appendChild(head);

    // Body
    const body = document.createElement("div");
    Object.assign(body.style, {
        padding: "14px",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        background: "rgba(235,245,255,0.4)"
    });
    box.appendChild(body);

    // Input row
    const row = document.createElement("div");
    Object.assign(row.style, {
        display: "flex",
        gap: "8px",
        padding: "12px",
        background: "linear-gradient(135deg,#3b82f6,#60a5fa)"
    });

    const input = document.createElement("input");
    Object.assign(input.style, {
        flex: 1,
        padding: "10px 16px",
        borderRadius: "30px",
        border: "1px solid rgba(59,130,246,0.4)",
        background: "rgba(255,255,255,0.8)",
        color: "#1e3a8a",
        outline: "none",
        fontSize: "15px",
        boxShadow: "0 0 10px rgba(59,130,246,0.15) inset"
    });

    const btn = document.createElement("button");
    btn.innerText = "Send";
    Object.assign(btn.style, {
        padding: "10px 20px",
        borderRadius: "30px",
        background: "linear-gradient(135deg,#60a5fa,#3b82f6)",
        color: "white",
        border: "none",
        fontWeight: "600",
        cursor: "pointer",
        transition: ".25s"
    });
    btn.onmouseenter = () => btn.style.transform = "scale(1.07)";
    btn.onmouseleave = () => btn.style.transform = "scale(1)";

    row.appendChild(input);
    row.appendChild(btn);
    box.appendChild(row);

    // Bubble toggle
    bubble.onclick = () =>
        box.style.display = box.style.display === "none" ? "flex" : "none";

    // Add messages
    function addMsg(t, s) {
        const wrapper = document.createElement("div");
        Object.assign(wrapper.style, {
            maxWidth: "100%",
            overflowX: s === "bot" ? "auto" : "visible"
        });

        const m = document.createElement("div");

        if (s === "bot") m.innerHTML = t;
        else m.innerText = t;

        Object.assign(m.style, {
            padding: "8px 10px",
            borderRadius: "10px",
            display: "inline-block",
            marginBottom: "10px",
            whiteSpace: "nowrap",
            background: s === "user" 
                ? "rgba(59,130,246,0.15)" 
                : "rgba(255,255,255,0.9)",
            color: s === "user" ? "#1e3a8a" : "#1e3a8a"
        });

        wrapper.appendChild(m);
        body.appendChild(wrapper);
        body.scrollTop = body.scrollHeight;
    }

    // Send message
    async function send() {
        const msg = input.value.trim();
        if (!msg) return;

        addMsg(msg, "user");
        input.value = "";

        try {
            const res = await fetch("/chatbot-api/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: msg })
            });

            const data = await res.json();
            addMsg(data.response, "bot");
        } catch {
            addMsg("Server Error. Try again.", "bot");
        }
    }

    btn.onclick = send;
    input.addEventListener("keypress", e => e.key === "Enter" && send());
});
