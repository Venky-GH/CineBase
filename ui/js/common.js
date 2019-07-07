function show_toast(msg_type, title, msg='') {
  let color;
  if (msg_type === 1)
    color = '#0BB76C';
  else if (msg_type === 0)
    color = '#e53935';
  else
    color = '#df8a00';
  iziToast.show({
    theme: 'dark',
    color: color,
    pauseOnHover: true,
    progressBar: true,
    position: "bottomCenter",
    title: title,
    message: msg
  })
}