init()
let tally = {}
var textFile = null

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

function process(output) {
    // clear highlighting
    let allNamed = document.querySelectorAll(`input, select, div[name='shape1'],
                                        div[name='shape2'], div[name='type']`)
    allNamed.forEach(elem => elem.style.backgroundColor = '')

    submit_type = document.getElementById("submit_type")
    if (submit_type.value == "evaluate") {
        evaluate(output)
    }
    else if (submit_type.value == "add_container") {
        addContRack(output, "container")
    }
    else {
        addContRack(output, "rack")
    }
}

function evaluate(output) {
    // make a name for the combination of the chosen container and rack
    let contRackCombo = ""
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

    // compute results
    let results = checkVals(output, applicableKeyVals)

    // keep track of how the user is doing
    if (contRackCombo in tally) {
        tally[contRackCombo] += Math.abs(results[0] - 1)
    }
    else {
        tally[contRackCombo] = Math.abs(results[0] - 1)
    }

    // send user results
    if (results[0]) {
        alert(`Good job! All correct for ${contRackCombo}!`)
        tally[contRackCombo] = 0
    }
    else {
        alert(`Attempt number ${tally[contRackCombo]} for ${contRackCombo}!\n
                The highlighted fields are incorrect`)
        
        // highlight incorrect fields
        for (const [incKey, incVal] of Object.entries(results[1])) {
            let elems = document.getElementsByName(incKey)
            elems.forEach(elem => elem.style.backgroundColor = "#FDFF47")
        }
    }
        
    if (tally[contRackCombo] == 3) {
        alert(`Oh no! You've used all 3 tries for ${contRackCombo}`)
    }
}

function addContRack(output, contOrRack) {
    // make a name for the combination of the chosen container and rack
    let name = prompt(`Values for this ${contOrRack} will be filled in
                    from the applicable section of the form.\n
                    What is the name of the ${contOrRack} (no quotes)?`)
    // let another = prompt(`Would you like to enter another ${contOrRack} (y/n)?
    //                     If yes, your download will be available after the next
    //                     ${contOrRack} submission and answer "n" to this prompt`)
    
    rackFields = ["rack_name", "up_width_x", "low_width_x", "seg_height_x",
    "plate_height", "plate_ch", "stack_height", "dist_bp_to_ob",
    "dist_bh", "dist_br", "left_oe", "front_oe", "width", "length"]
    let text = ''
    let newText = ''
    
    if (contOrRack == "container") {
        text = "let cont_truth =\n" + JSON.stringify(cont_truth).slice(0, -1)
        newText += `,\n"${name}":\n{\n"n_segs": ${output["n_segs"]}`
        for (const [key, value] of Object.entries(output)) {
            if (!rackFields.includes(key) && !(key == "cont_name")
                && !(key == "n_segs")) {
                if (key == "shape1" || key == "shape2") {
                    newText += `,\n"${key}": "${value}"`
                }
                else {
                    newText += `,\n"${key}": ${value}`
                }
            }
        }
        newText += "\n}"
        link = document.getElementById('cont_download')
    }
    else {
        text = "let rack_truth =\n" + JSON.stringify(rack_truth).slice(0, -1)
        newText += `,\n"${name}":\n{\n"type": "${output["type"]}"`
        for (const [key, value] of Object.entries(output)) {
            if (rackFields.includes(key) && !(key == "rack_name")
                && !(key == "type")) {
                newText += `,\n"${key}": ${value}`
            }
        }
        newText += "\n}"
        link = document.getElementById('rack_download')
    }
    text += newText + "\n}"
    let data = new Blob([text], {type: 'text/plain'})

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {window.URL.revokeObjectURL(textFile)}
    textFile = window.URL.createObjectURL(data)
    link.href = textFile
    link.style.display = 'block'
}

// iterates through list of true key value pairs and evaluates against output
function checkVals(output, keyVals) {
    // array of fields that need to be exact
    let exact = ["n_segs", "shape1", "shape2", "type"]
    let incorrectItems = {}
    let retVal = [1]
    // let rackItems = ["type", "up_width_x", "low_width_x", "seg_height_x", "plate_height",
    //                 "plate_ch", "stack_height", "dist_bp_to_ob", "dist_bh", "dist_br",
    //                 "left_oe", "front_oe", "width", "length"]

    for (const [key, trueValue] of Object.entries(keyVals)) {
        // if this requires an exactly correct answer
        if (exact.includes(key)) {
            if (trueValue != output[key]) {
                // track what was wrong and # tries for a container and rack pair
                incorrectItems[key] = output[key]
                retVal[0] = 0
            }
        }
        // if we can give 5% leeway on the answer
        else if ((trueValue < output[key] * .95) ||
                (trueValue > output[key] * 1.05)) {
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

    let measBlock = document.getElementById(`interMeasures${num}`)
    switch(val) {
        case "cylinder": {
            measBlock.innerHTML = 
            `<div>
                <label>Upper Internal Diameter:</label>
                <input type="text" id="up_ID${num}" name="up_ID${num}" onchange="volumes()">mm
            </div>
            <div>
                <label>Internal Segment Height:</label>
                <input type="text" id="in_SH${num}" name="in_SH${num}" onchange="volumes()">mm
            </div>`
            break}

        case "rectangle": {
            measBlock.innerHTML = 
            `<div>
                <label>Width:</label>
                <input type="text" id="width${num}" name="width${num}" onchange="volumes()">mm
            </div>
            <div>
                <label>Length:</label>
                <input type="text" id="length${num}" name="length${num}" onchange="volumes()">mm
            </div>
            <div>
                <label>Internal Segment Height:</label>
                <input type="text" id="in_SH${num}" name="in_SH${num}" onchange="volumes()">mm
            </div>`
            break}

        case "inverted_cone":
        case "v_cone": {
            measBlock.innerHTML =
            `<div>
                <label>Upper Internal Diameter:</label>
                <input type="text" id="up_ID${num}" name="up_ID${num}" onchange="volumes()">mm
            </div>
            <div>
                <label>Lower Internal Diameter:</label>
                <input type="text" id="low_ID${num}" name="low_ID${num}" onchange="volumes()">mm
            </div>
            <div>
                <label>Internal Segment Height:</label>
                <input type="text" id="in_SH${num}" name="in_SH${num}" onchange="volumes()">mm
            </div>`
            break}

        case "round_base":
        case "v_base": {
            measBlock.innerHTML =
            `<div>
                <label>Upper Internal Diameter:</label>
                <input type="text" id="up_ID${num}" name="up_ID${num}" onchange="volumes()">mm
            </div>
            <div>
                <label>Internal Segment Height:</label>
                <input type="text" id="in_SH${num}" name="in_SH${num}" onchange="volumes()">mm
            </div>`
            break}
    }
}

function volumes() {
    let shape1Children = document.querySelectorAll("#shape1 > input")
    let shape2Children = document.querySelectorAll("#shape2 > input")
    let shape1 = 'blank'
    let shape2 = 'blank'
    for (elem of shape1Children) {
        if (elem.checked) {shape1 = elem.value}
    }
    for (elem of shape2Children) {
        if (elem.checked) {shape2 = elem.value}
    }
    // have to use number.epsilon cause of js's janky math, still incorrect with
    // values like 1.3549999999999999 (rounds to 1.36)
    let vol1 = Math.round((getVols(shape1, 1) + Number.EPSILON) * 100) / 100
    let vol2 = Math.round((getVols(shape2, 2) + Number.EPSILON) * 100) / 100
    let total = Math.round(vol1 + vol2)

    console.log(`shape1, shape2: ${shape1}, ${shape2}`)
    console.log(`vol1, vol2, total: ${vol1}, ${vol2}, ${total}`)
    document.getElementById("vol1").innerHTML = `Volume: ${vol1} mm<sup>3</sup>`
    document.getElementById("vol2").innerHTML = `Volume: ${vol2} mm<sup>3</sup>`
    document.getElementById("total_vol").innerHTML = `Total Volume: ${total} mm<sup>3</sup>`
}

function getVols(shape, segment) {
    switch(shape) {
        case "rectangle": {
            let width = 0
            let length = 0
            let in_SH = 0
            try {
                width = document.getElementById(`width${segment}`).value
                length = document.getElementById(`length${segment}`).value
                in_SH = document.getElementById(`in_SH${segment}`).value
            } catch (error) {
                return 0
            }

            return width * length * in_SH
        }

        case "cylinder": {
            let up_ID = 0
            let in_SH = 0
            try {
                up_ID = document.getElementById(`up_ID${segment}`).value
                in_SH = document.getElementById(`in_SH${segment}`).value
            } catch (error) {
                return 0
            }

            return Math.PI * Math.pow(up_ID / 2, 2) * in_SH
        }

        case "inverted_cone":
        case "v_cone": {
            let up_ID = 0
            let low_ID = 0
            let in_SH = 0
            try {
                up_ID = document.getElementById(`up_ID${segment}`).value
                low_ID = document.getElementById(`low_ID${segment}`).value
                in_SH = document.getElementById(`in_SH${segment}`).value
            } catch (error) {
                return 0
            }
            
            return Math.PI * in_SH * (Math.pow(up_ID / 2, 2) +
                    Math.pow(low_ID / 2, 2) + up_ID * low_ID) / 3
        }
        
        case "blank":
        case "round_base": {
            return 0
        }

        case "v_base": {
            let up_ID = 0
            let in_SH = 0
            try {
                up_ID = document.getElementById(`up_ID${segment}`).value
                in_SH = document.getElementById(`in_SH${segment}`).value
            } catch (error) {
                return 0
            }

            return Math.PI * in_SH * Math.pow(up_ID / 2, 2) / 3
        }
    } 
}