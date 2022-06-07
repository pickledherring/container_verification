// could use sessionStorage to keep the form between switching pages
// form submission
let form = document.querySelector("form")
form.addEventListener("submit", function(event) {
  let data = new FormData(form)
  let output = ""
  for (const entry of data) {
    output = output + entry[0] + "=" + entry[1] + "\n"
  }
  console.log(output)
  event.preventDefault();
}, false)

function changeOps(val, num) {
    // changes the image and measurement options in the "segment approximation"
    // sections based on the radio button clicked
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