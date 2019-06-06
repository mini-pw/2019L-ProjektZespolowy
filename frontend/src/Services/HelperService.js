export default class HelperService {
  zoomHelperShown = false;

  showZoomHelper() {
    if (!this.zoomHelperShown) {
      this.zoomHelperShown = true;
      return true;
    }
    return false;
  }
}
