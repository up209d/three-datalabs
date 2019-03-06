// A switch case for file type detection base on the file name & extension

export default function(ext) {
  let contentType = null;
  switch (ext) {
    case 'js': {
      contentType = 'text/javascript';
      break;
    }
    case 'json': {
      contentType = 'application/json';
      break;
    }
    case 'css': {
      contentType = 'text/css';
      break;
    }
    case 'ico': {
      contentType = 'image/x-icon';
      break;
    }
    case 'png':
    case 'gif':
    case 'jpeg':
    case 'jpg': {
      contentType = 'image/' + ext;
      break;
    }
    case 'svg': {
      contentType = 'image/svg+xml';
      break;
    }
    case 'eot':
    case 'ttf':
    case 'woff':
    case 'woff2': {
      contentType = 'font/' + ext;
      break;
    }
    case 'html': {
      contentType = 'text/html';
      break;
    }
    default: {
      contentType = 'text/plain';
    }
  }
  return {
    ext,
    contentType
  }
}