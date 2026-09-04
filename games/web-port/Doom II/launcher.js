"use strict";

// Global on purpose: index.html calls this directly with onclick="startDoom()".
let doomStarted = false;

function startDoom() {
  const library = document.getElementById("library");
  const game = document.getElementById("game");
  const canvas = document.getElementById("canvas");
  const loading = document.getElementById("loading");

  // Change the page immediately. If this does not happen, launcher.js was not loaded.
  library.style.display = "none";
  game.classList.add("active");
  loading.textContent = "Loading Doom II…";
  canvas.focus();

  if (doomStarted) return;
  doomStarted = true;

  window.Module = {
    canvas: canvas,
    locateFile: function(file) {
      return "./" + file;
    },
    print: function(text) { console.log("[DOOM II]", text); },
    printErr: function(text) { console.error("[DOOM II]", text); },
    setStatus: function(text) {
      if (text) loading.textContent = text;
    },
    onRuntimeInitialized: function() {
      loading.style.display = "none";
      canvas.focus();
    },
    onAbort: function(reason) {
      console.error("Doom II aborted:", reason);
      loading.textContent = "Engine error: " + reason;
      doomStarted = false;
    }
  };

  const engine = document.createElement("script");
  engine.src = "./doom2.js";
  engine.async = false;
  engine.onload = function() {
    console.log("doom2.js loaded");
  };
  engine.onerror = function() {
    loading.textContent = "ERROR: doom2.js could not be loaded.";
    doomStarted = false;
  };
  document.body.appendChild(engine);
}

// Backup listener as well.
document.addEventListener("DOMContentLoaded", function() {
  const button = document.getElementById("play");
  if (button) button.addEventListener("click", startDoom);
});
