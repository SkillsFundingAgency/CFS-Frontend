function setActiveNavBar(areaName: string) {
    // By default use the first part of the path as the area to use to set the active navbar segment
    let activeAreaName: string = location.pathname.split("/")[1];
    if (areaName) {
        // Override the location with the area supplied
        activeAreaName = areaName;
    }

    $('nav a[href^="/' + activeAreaName + '"]').next().addClass('navbar-item-overlay-active');
}