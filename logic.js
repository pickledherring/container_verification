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
// 4. see if tally is at 3, if so, send another message?
// 5. add fun elements
function process(output) {
    let contRackCombo = ""
    let tally = {}
    applicableKeyVals = {}

    // if the user chose a container name
    if (output.cont_name) {
        for (const [key, trueValue] of Object.entries(cont_truth[output.cont_name])) {
            applicableKeyVals[key] = trueValue
        }
        contRackCombo = output.cont_name
    }
    
    // if a rack name was chosen
    if (output.rack_name) {
        for (const [key, trueValue] of Object.entries(rack_truth[output.rack_name])) {
            applicableKeyVals[key] = trueValue
        }
        
        if (contRackCombo.length > 0) {
            contRackCombo += ` and ${output.rack_name}`
        }
        else
            contRackCombo = output.rack_name
    }

    // if they chose neither
    if (output.cont_name == " " && output.rack_name == " ") {
        alert("Please choose a container, rack, or both")
    }

    // keep track of how the user is doing
    let results = evaluate(output, applicableKeyVals)
    if (contRackCombo in tally) {
        tally[contRackCombo] += results[0]
    }
    else {
        tally[contRackCombo] = results[0]
    }

    // send user results
    if (results[0]) {
        alert(`Good job! All correct for ${contRackCombo}!`)
    }
    else {
        let msg = `Oh no! These items were incorrect for ${contRackCombo}:\n`
        for (const [incKey, incVal] of Object.entries(results[1])) {
            msg += `${incKey}: ${incVal}\n`
        }
        alert(msg)
    }
}

// iterates through list of true key value pairs and evaluates against output
function evaluate(output, keyVals) {
    // array of fields that need to be exact
    let exact = ["n_segs", "shape1", "shape2", "type"]
    let incorrectItems = {}
    let retVal = [1]
    // let rackItems = ["type", "up_width_x", "low_width_x", "seg_height_x", "plate_height",
    //                 "plate_ch", "stack_height", "dist_bp_to_ob", "dist_bh", "dist_br",
    //                 "left_oe", "front_oe", "width", "length"]

    for (const [key, trueValue] of Object.entries(keyVals)) {
        // if this require an exactly correct answer
        if (exact.includes(key) && trueValue == output[key]) {
            console.log(`exact evaluation match ${key}: ${trueValue}`)
        }
        // if we can give 5% leeway on the answer
        else if ((trueValue >= output[key] * .95) &&
                (trueValue <= output[key] * 1.05)) {
            console.log(`inexact evaluation match ${key}: ${trueValue}`)
        }
        // keep track of what was wrong and # tries for a container and rack pair
        else {
            console.log(`no match ${key}: ${trueValue}`)
            incorrectItems[key] = output[key]
            retVal[0] = 0
        }
    }

    // retVal[0] = 0 or 1
    // 0 is falsy and indicates the user failed, 1 is truthy and indicates the user passed
    retVal[1] = incorrectItems
    return retVal
}

// changes the image and measurement options in the "segment approximation"
// sections based on the radio button clicked
function changeOps(val, num) {
    // change image
    let img = document.getElementById(`shape_img${num}`)
    img.src = `images/${val}.png`
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