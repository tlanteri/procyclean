const applicationLink = document.querySelector("#application-link");
const copyLinkButton = document.querySelector("#copy-link-button");
const nativeShareButton = document.querySelector("#native-share-button");
const shareMethods = document.querySelector("#share-methods");
const whatsappShareLink = document.querySelector(
  "#whatsapp-share-link"
);
const emailShareLink = document.querySelector("#email-share-link");
const smsShareLink = document.querySelector("#sms-share-link");
const shareMessage = document.querySelector("#share-message");
const qrCodeContainer = document.querySelector("#qr-code");
const qrError = document.querySelector("#qr-error");
const localWarning = document.querySelector("#local-warning");

const applicationUrl = new URL("../index.html", window.location.href);
applicationUrl.search = "";
applicationUrl.hash = "";
const shareUrl = applicationUrl.href;
const shareTitle = "PRO-CYCLEAN";
const shareText =
  "Découvrez l’application pédagogique PRO-CYCLEAN.";
const completeShareText = `${shareText} ${shareUrl}`;

applicationLink.value = shareUrl;
whatsappShareLink.href =
  `https://wa.me/?text=${encodeURIComponent(completeShareText)}`;
emailShareLink.href =
  `mailto:?subject=${encodeURIComponent(shareTitle)}` +
  `&body=${encodeURIComponent(completeShareText)}`;
smsShareLink.href =
  `sms:?body=${encodeURIComponent(completeShareText)}`;

if (
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
) {
  localWarning.hidden = false;
}

if (typeof window.QRCode === "function") {
  new window.QRCode(qrCodeContainer, {
    text: shareUrl,
    width: 280,
    height: 280,
    colorDark: "#001f5b",
    colorLight: "#ffffff",
    correctLevel: window.QRCode.CorrectLevel.H
  });
} else {
  qrError.textContent =
    "Le QR code n’a pas pu être généré. Le lien reste disponible.";
}

function fallbackCopy() {
  try {
    applicationLink.focus();
    applicationLink.select();
    applicationLink.setSelectionRange(0, applicationLink.value.length);
    return document.execCommand("copy");
  } catch (error) {
    return false;
  }
}

async function copyApplicationLink() {
  shareMessage.textContent = "";

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    } else if (!fallbackCopy()) {
      throw new Error("Copie indisponible.");
    }
    shareMessage.textContent = "Lien copié !";
  } catch (error) {
    if (fallbackCopy()) {
      shareMessage.textContent = "Lien copié !";
      return;
    }
    shareMessage.textContent =
      "Sélectionnez le lien puis copiez-le manuellement.";
  }
}

async function shareApplication() {
  shareMessage.textContent = "";

  if (typeof navigator.share !== "function") {
    shareMethods.hidden = !shareMethods.hidden;
    nativeShareButton.setAttribute(
      "aria-expanded",
      String(!shareMethods.hidden)
    );
    if (!shareMethods.hidden) {
      whatsappShareLink.focus();
    }
    return;
  }

  try {
    await navigator.share({
      title: shareTitle,
      text: shareText,
      url: shareUrl
    });
    shareMessage.textContent = "Application partagée.";
  } catch (error) {
    if (error.name !== "AbortError") {
      shareMethods.hidden = false;
      nativeShareButton.setAttribute("aria-expanded", "true");
      shareMessage.textContent =
        "Choisissez un moyen de communication ci-dessous.";
    }
  }
}

copyLinkButton.addEventListener("click", copyApplicationLink);
nativeShareButton.addEventListener("click", shareApplication);
