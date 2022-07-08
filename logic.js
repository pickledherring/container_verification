init()
let tally = {}
// download link for new rack/cont_truth.js
var fileURL = null
// contents of new rack/cont_truth.js
var contContents = "let cont_truth =\n" + JSON.stringify(cont_truth, null, 4).slice(0, -2)
var rackContents = "let rack_truth =\n" + JSON.stringify(rack_truth, null, 4).slice(0, -2)
var anotherContainer = ""
var anotherRack = ""

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
        // add a container to a list to be added, can add more after
        evaluate(output)
    }
    else if (submit_type.value == "add_container") {
        // add one or more containers
        addContRack(output, "container")
    }
    else {
        // add a rack to a list to be added, can add more after
        addContRack(output, "rack")
    }
}

function evaluate(output) {
    // make a name for the combination of the chosen container and rack
    let contRackCombo = ""
    applicableKeyVals = {}

    // if the user chose a container name
    if (output.cont_name) {
        // assemble dictionary of true values to search/compare against
        for (const [key, trueValue] of Object.entries(cont_truth[output.cont_name])) {
            applicableKeyVals[key] = trueValue
        }
        // name creation, doesn't affect much
        contRackCombo = output.cont_name
    }
    
    // if a rack name was chosen
    if (output.rack_name) {
        // assemble dictionary of true values to search/compare against
        for (const [key, trueValue] of Object.entries(rack_truth[output.rack_name])) {
            applicableKeyVals[key] = trueValue
        }
        
        // more name creation
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
            if (incKey == "shape1") {
                elems = document.querySelectorAll("div#interMeasures1>div>input")
                elems.forEach(elem => elem.style.backgroundColor = "#FDFF47")
            }
            if (incKey == "shape2") {
                elems = document.querySelectorAll("div#interMeasures2>div>input")
                elems.forEach(elem => elem.style.backgroundColor = "#FDFF47")
            }
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
    
    if (!name) {
        name = prompt(`Name cannot be blank.\n
                    What is the name of the ${contOrRack} (no quotes)?`)
    }

    rackFields = ["rack_name", "up_width_x", "low_width_x", "seg_height_x",
    "plate_height", "plate_ch", "stack_height", "dist_bp_to_ob",
    "dist_bh", "dist_br", "left_oe", "front_oe", "width", "length"]

    // following is some rather painful file writing
    // could be improved, maybe just make an object and write the file from that
    let newText = ''
    
    if (contOrRack == "container") {
        if (output["n_segs"]) {
            newText += `,\n\t"${name}":{\n\t\t"n_segs": ${output["n_segs"]}`
        } else {
            newText += `,\n\t"${name}":{\n\t\t"n_segs": 1`
        }

        for (const [key, value] of Object.entries(output)) {
            if (!rackFields.includes(key) && !(key == "cont_name")
                && !(key == "n_segs") && value) {
                if (value != "blank" && key == "shape1" || key == "shape2") {
                    newText += `,\n\t\t"${key}": "${value}"`
                }
                else {
                    newText += `,\n\t\t"${key}": ${value}`
                }
            }
        }
        newText += "\n\t}"

        anotherContainer = getAnother(contOrRack)

        if (anotherContainer == "y" || anotherContainer == "yes") {
            contContents += newText
        }
        else if (anotherContainer == "n" || anotherContainer == "no") {
            contContents += newText + "\n}"
            link = document.getElementById('cont_download')
            createLink(contContents, link)
            contContents = "let cont_truth =\n" + JSON.stringify(cont_truth, null, 4).slice(0, -2)
        }
        else {
            contContents = "let cont_truth =\n" + JSON.stringify(cont_truth, null, 4).slice(0, -2)
        }
    }

    else {
        newText += `,\n\t"${name}":{\n\t\t"type": "${output["type"]}"`
        for (const [key, value] of Object.entries(output)) {
            if (rackFields.includes(key) && !(key == "rack_name")
                && !(key == "type") && value) {
                newText += `,\n\t\t"${key}": ${value}`
            }
        }
        newText += "\n\t}"

        anotherRack = getAnother(contOrRack)

        if (anotherRack == "y" || anotherRack == "yes") {
            rackContents += newText
        }
        else if (anotherRack == "n" || anotherRack == "no") {
            rackContents += newText + "\n}"
            link = document.getElementById('rack_download')
            createLink(rackContents, link)
            rackContents = "let rack_truth =\n" + JSON.stringify(rack_truth, null, 4).slice(0, -2)
        }
        else {
            rackContents = "let rack_truth =\n" + JSON.stringify(rack_truth, null, 4).slice(0, -2)
        }
    }

    function getAnother(type) {
        let another = prompt(`Would you like to enter another ${type} (y/n)?
                        If yes, your download will be available after the next
                        ${type} submission and answer "n" to this prompt`)

        if (!["y", "yes", "n", "no"].includes(another.toLowerCase())) {
            another = prompt(`Please answer with "y" or "n" (no quotes).
                            Any other response will erase this submission.
                            Would you like to enter another ${type}?`)
        }

        return another.toLowerCase()
    }

    function createLink(contents, link) {
        let data = new Blob([contents], {type: 'text/plain'})
    
        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (fileURL !== null) {window.URL.revokeObjectURL(fileURL)}
        fileURL = window.URL.createObjectURL(data)
        link.href = fileURL
        link.style.display = 'block'
    }
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
        case "blank":
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

    // resetting applicable volumes
    let volume = document.getElementById(`vol${num}`)
    let totalVol = document.getElementById(`total_vol`)
    if (totalVol.value && volume.value) {
        totalVol.innerHTML = `Total Volume: ${totalVol.value - volume.value} mm<sup>3</sup>`
        totalVol.value = totalVol.value - volume.value
    }

    if (volume.value) {
        volume.innerHTML = `Volume: 0 mm<sup>3</sup>`
        volume.value = 0
    }
}

function volumes() {
    // find our radio value, need this if none were checked
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
    let hemi = Math.round((getVols("hemi", 2) + Number.EPSILON) * 100) / 100
    let total = Math.round((vol1 + vol2 + Number.EPSILON) * 100) / 100

    // write the volumes on the page
    document.getElementById("vol1").innerHTML = `Volume: ${vol1} mm<sup>3</sup>`
    if (shape2 == "round_base") {
        document.getElementById("vol2").innerHTML = `Volume: ${vol2} mm<sup>3</sup></strong>
        <br>
        <strong id="hemi" value=${hemi}>Hemisphere Volume: ${hemi} mm<sup>3</sup></strong>`
    } else{
        document.getElementById("vol2").innerHTML = `Volume: ${vol2} mm<sup>3</sup>`
    }
    document.getElementById("total_vol").innerHTML = `Total Volume: ${total} mm<sup>3</sup>`
    // write new values to the attributes
    document.getElementById("vol1").value = vol1
    document.getElementById("vol2").value = vol2
    document.getElementById("total_vol").value = total
}

function getVols(shape, segment) {
    switch(shape) {
        case "rectangle": {
            let width = 0
            let length = 0
            let in_SH = 0
            // will error if fields left blank, assume that means value = 0
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
            
            return Math.PI * in_SH * ((Math.pow(up_ID / 2, 2) + up_ID / 2)
                     * (Math.pow(low_ID / 2, 2) + low_ID / 2)) / 3
        }
        
        case "blank": {
            return 0
        }

        case "round_base": {
            let up_ID = 0
            let in_SH = 0
            try {
                up_ID = document.getElementById(`up_ID${segment}`).value
                in_SH = document.getElementById(`in_SH${segment}`).value
            } catch (error) {
                return 0
            }
            
            // not assuming hemisphere perfection
            return Math.PI * Math.pow(in_SH, 2) * (3 * (up_ID / 2) - in_SH) / 3
        }

        case "hemi": {
            let up_ID = 0
            let in_SH = 0
            try {
                up_ID = document.getElementById(`up_ID${segment}`).value
                in_SH = document.getElementById(`in_SH${segment}`).value
            } catch (error) {
                return 0
            }
            
            // assuming this is a perfect hemisphere
            return 2 * Math.PI * (Math.pow(up_ID / 2, 3)) / 3
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

function clearContainer() {
    // resets values
    document.getElementById("opt_conts").value = ''
    document.getElementsByName("clld")[0].value = 1
    document.getElementById("blank").checked = true
    document.getElementById("blank2").checked = true
    let container = document.querySelector("#container")
    let textFields = container.querySelectorAll("input[type=text]")
    textFields.forEach(elem => elem.value = '')
    // clear highlighting
    let allNamed = document.querySelectorAll(`input, select, div[name='shape1'],
    div[name='shape2'], div[name='type']`)
    allNamed.forEach(elem => elem.style.backgroundColor = '')
}

function clearRack() {
    // resets values
    document.getElementById("opt_racks").value = ''
    document.getElementById("blank3").checked = true
    let container = document.querySelector("#rack")
    let textFields = container.querySelectorAll("input[type=text]")
    textFields.forEach(elem => elem.value = '')
}