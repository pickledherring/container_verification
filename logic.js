// could use sessionStorage to keep the form between switching pages

init()

function init() {
    // populate name drop downs, cont/rack_truth obtained from
    // container_rack_truth.js
    for (const name of Object.keys(cont_truth)){
        let opt_conts = document.getElementById('opt_conts')
        opt_conts.innerHTML += 
            `<option>${name}</option>`
    }

    for (const name of Object.keys(rack_truth)){
        let opt_racks = document.getElementById('opt_racks')
        opt_racks.innerHTML += 
            `<option>${name}</option>`
    }

    // get form submission
    let form = document.querySelector("form")
    form.addEventListener("submit", function(event) {
    let formData = new FormData(form)
    let output = {}
    for (const entry of formData) {
        output[`${entry[0]}`] = entry[1]
    }

    // should prevent a page refresh on submission
    event.preventDefault()
    // form evaluation logic
    process(output)
    }, false)
}

// to do:
// 1. add segment field use logic (if n_segs == 1, ignore seg 2)
// 2. extend to rack
// 3. send a message with results, tally attempt if failed
// 4. see if tally is at 3, if so, send another message?
// 5. add fun elements
function process(output) {
    // console.log("output w key:", output["n_segs"])
    // for (const [key, value] of Object.entries(output)) {
    //         console.log(key, value)
    //     }

    // array of fields that need to be exact
    let exact = ["n_segs", "shape1", "shape2", "type"]

    // container evaluation
    if ((output.cont_name) && output.cont_name in cont_truth) {
        for (const [key, trueValue] of Object.entries(cont_truth[output.cont_name])) {
            if (exact.includes(key) && trueValue == output[key]) {
                console.log(`exact evalutaion match ${key}: ${trueValue}`)
            }
            else if ((trueValue >= output[key] * .95) &&
                    (trueValue <= output[key] * 1.05)) {
                console.log(`inexact evaluation match ${key}: ${trueValue}`)
            }
            else {
                console.log(`no match ${key}: ${trueValue}`)
            }
        }
    
    // rack evaluation
    }
    if ((output.rack_name) && output.rack_name in rack_truth) {
        console.log(rack_truth[output.rack_name])
    }
}

// changes the image and measurement options in the "segment approximation"
// sections based on the radio button clicked
function changeOps(val, num) {
    // change image
    let img = document.getElementById(`shape_img${num}`)
    img.src= `images/${val}.png`
    // change measurement options, segment 1
    if (num == 1) {
        let measBlock = document.getElementById("interMeasures1")
        switch(val) {
            case "cylinder": {
                measBlock.innerHTML = 
                `<div>
                    <label>Upper Internal Diameter:</label>
                    <input type="text" name="up_ID1">mm
                </div>
                <div>
                    <label>Internal Segment Height:</label>
                    <input type="text" name="in_SH1">mm
                </div>`
                break}

            case "rectangle": {
                measBlock.innerHTML = 
                `<div>
                    <label>Width:</label>
                    <input type="text" name="width1">mm
                </div>
                <div>
                    <label>Length:</label>
                    <input type="text" name="length1">mm
                </div>
                <div>
                    <label>Internal Segment Height:</label>
                    <input type="text" name="in_SH1">mm
                </div>`
                break}

            case "inverted_cone":
            case "v_cone": {
                measBlock.innerHTML =
                `<div>
                    <label>Upper Internal Diameter:</label>
                    <input type="text" name="up_ID1">mm
                </div>
                <div>
                    <label>Lower Internal Diameter:</label>
                    <input type="text" name="low_ID1">mm
                </div>
                <div>
                    <label>Internal Segment Height:</label>
                    <input type="text" name="in_SH1">mm
                </div>`
                break}
        }
    }
    // segment 2
    else {
        let measBlock = document.getElementById("interMeasures2")
        switch(val) {
            case "cylinder": {
                measBlock.innerHTML = 
                `<div>
                    <label>Upper Internal Diameter:</label>
                    <input type="text" name="up_ID2">mm
                </div>
                <div>
                    <label>Internal Segment Height:</label>
                    <input type="text" name="in_SH2">mm
                </div>`
                break}

            case "rectangle": {
                measBlock.innerHTML = 
                `<div>
                    <label>Width:</label>
                    <input type="text" name="width2">mm
                </div>
                <div>
                    <label>Length:</label>
                    <input type="text" name="length2">mm
                </div>
                <div>
                    <label>Internal Segment Height:</label>
                    <input type="text" name="in_SH2">mm
                </div>`
                break}

            case "inverted_cone":
            case "v_cone": {
                measBlock.innerHTML =
                `<div>
                    <label>Upper Internal Diameter:</label>
                    <input type="text" name="up_ID2">mm
                </div>
                <div>
                    <label>Lower Internal Diameter:</label>
                    <input type="text" name="low_ID2">mm
                </div>
                <div>
                    <label>Internal Segment Height:</label>
                    <input type="text" name="in_SH2">mm
                </div>`
                break}

            case "round_base":
            case "v_base": {
                measBlock.innerHTML =
                `<div>
                    <label>Upper Internal Diameter:</label>
                    <input type="text" name="up_ID2">mm
                </div>
                <div>
                    <label>Internal Segment Height:</label>
                    <input type="text" name="in_SH2">mm
                </div>`
                break}
        }
    }
}