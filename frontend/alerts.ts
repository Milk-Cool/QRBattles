export type AlertConfig = {
    cancel?: boolean;
    textInputID?: string;
    cancelText?: string;
    okText?: string;
};

const overlay = document.querySelector("#overlay") as HTMLDivElement;
const alertBox = document.querySelector("#alert") as HTMLDivElement;
export const makeAlert = async (config: AlertConfig, ...elements: (HTMLElement | string)[]): Promise<boolean | string> => {
    for(const child of Array.from(alertBox.children)) {
        child.remove();
    }

    for(let element of elements) {
        if(typeof element === "string") {
            const txt = element;
            element = document.createElement("h2");
            element.innerText = txt;
        }
        alertBox.appendChild(element);
    }

    alertBox.appendChild(document.createElement("br"));
    let cancelButton: HTMLButtonElement | null = null;
    if(config.cancel === true) {
        cancelButton = document.createElement("button");
        cancelButton.classList.add("alertbtn");
        cancelButton.innerText = config.cancelText || "Cancel";
        alertBox.appendChild(cancelButton);
    }
    const okButton = document.createElement("button");
    okButton.classList.add("alertbtn");
    okButton.innerText = config.okText || "OK";
    alertBox.appendChild(okButton);

    overlay.classList.remove("hidden");
    alertBox.classList.remove("hidden");

    const res = await new Promise(resolve => {
        if(cancelButton !== null) cancelButton.addEventListener("click", () => resolve(false));
        okButton.addEventListener("click", () => resolve(true));
    });
    overlay.classList.add("hidden");
    alertBox.classList.add("hidden");
    if(res === false) return false;
    return config.textInputID ? (document.querySelector(`#${config.textInputID}`) as HTMLInputElement).value : true;
}