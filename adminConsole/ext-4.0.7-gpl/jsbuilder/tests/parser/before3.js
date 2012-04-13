//<debug error>
    if (someCondition) {
        throw new Error("Some error");
    }
//</debug>

//<debug warn>
    if (someCondition) {
        console.warn("Some warning");
    }
//</debug>

//<debug info>
    if (someCondition) {
        console.log("Some info");
    }
//</debug>

//<debug>
    if (someCondition) {
        console.log("Some other info");
    }
//</debug>
