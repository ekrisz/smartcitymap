$(document).ready(function (){
    $(function() {
        setTimeout(function(e) {
            $("#otherDiv").hide();
            $("#showHideButton a").text("Show sidebar");
        }, 5000);
        $("#saveButton").prop("disabled", true);
    });
    $("path").mousedown(function(event) {
        switch(event.which) {
            case 1:
                break;
            case 2:
                event.preventDefault();
                $(this).attr("fill", "#eded11");
                $(this).attr("fill-opacity", 0.7);
                break;
            case 3:
                $(this).attr("fill", "#ed2132");
                $(this).attr("fill-opacity", 0.7);
                break;
        }
    });
    $("path").on('dblclick', function(event) {
        event.stopPropagation();
        $(this).attr("fill", "#5df542");
        $(this).attr("fill-opacity", 0.7);
    })
    $(document).bind("contextmenu", function(e) { return false; });
    $("#editableSelect").editableSelect();
    $("#showHideButton").click(function(){
        if($("#otherDiv").is(":hidden")) {
            $("#otherDiv").show();
            $("#showHideButton a").text("Hide sidebar");
        } else {
            $("#otherDiv").hide();
            $("#showHideButton a").text("Show sidebar");
        }        
    });
    $("path").on('dblclick', function(){
        $("#otherDiv").show();
        $("#showHideButton a").text("Hide sidebar");
        $(".leaflet-popup-content-wrapper").appendTo("#otherDiv");
        $(".leaflet-popup").hide();
    });
    let counter = 0;
    $(":checkbox").change(function() {
        if(this.checked) {
            counter++;
        } else {
            counter--;
        }
        if(counter > 1) {
            $("#minCheckboxWarning").hide();
            $("button").prop("disabled", false);
        } else {
            $("#minCheckboxWarning").show();
            $("button").prop("disabled", true);
        }
    });
    if(window.location.pathname.endsWith("admin")) {
        $("#showHideButton").hide();
    }
});