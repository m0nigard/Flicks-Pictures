//Toast function 
function launchToast(toastMessage) {
  let toast = document.getElementById("snackbar");
  document.getElementById("snackbar-text").innerHTML = toastMessage;
  toast.className = "show";
  setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
}