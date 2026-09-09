// Le lecteur intégré utilise le bandeau de sa page parente.
if (window.self === window.top) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "../../assets/navigation.css?v=25";
  document.head.append(stylesheet);

  const navigation = document.createElement("script");
  navigation.src = "../../assets/navigation.js?v=24";
  navigation.dataset.root = "../../";
  navigation.dataset.section = "resources";
  document.body.append(navigation);
}
