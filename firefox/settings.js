function inputList() {
    let el = document.createElement("div");
    
    let button = document.createElement("button");
    button.text = "Add";
    el.appendChild(button);
    
    let list = document.createElement("ul");
    el.appendChild(list);

    button.onclick = () => {
        let item = document.createElement("li");
        item.appendChild(document.createElement("input"));
        list.appendChild(item);
    };

    return el;
}

function main() {
    document.body.appendChild(inputList());
}

main();
