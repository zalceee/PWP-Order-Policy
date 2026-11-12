
const TARGET_ALUS = new Set([
    "1000018795001"
]);

let lastValidationState = null;


/*
============================================================
GET TRANSACTION AREA
============================================================
*/

function getTransactionArea() {
    return (
        document.getElementById("transactionItems") ||
        document.getElementById("searchTransactionItemsResultList") ||
        document.body
    );
}


/*
============================================================
CHECK TARGET ALU
============================================================
*/

function hasTargetALU() {

    const text = getTransactionArea().innerText || "";

    for (const alu of TARGET_ALUS) {
        if (new RegExp("\\b" + alu + "\\b").test(text)) {
            return true;
        }
    }

    return false;
}


/*
============================================================
CHECK DISCOUNT
============================================================
*/

function hasDiscount() {

    const text = getTransactionArea()
        .innerText
        .replace(/\s+/g, " ");

    const discountLabels = [
        /Disc\s*%/gi,
        /Disc(?:ount)?\s*Amt/gi
    ];

    for (const regex of discountLabels) {

        let match;

        while ((match = regex.exec(text)) !== null) {

            const remaining = text.substring(regex.lastIndex);

            const valueMatch = remaining.match(
                /^\s*[:：]?\s*[₱$]?\s*(-?[\d,]+(?:\.\d+)?)/ 
            );

            if (!valueMatch) continue;

            const value = parseFloat(
                valueMatch[1].replace(/,/g, "")
            );

            if (value > 0) {
                return true;
            }
        }
    }

    return false;
}


/*
============================================================
UPDATE TENDER BUTTON
============================================================
*/

function updateTenderButton() {

    const tenderButton = document.getElementById("tenderbutton");

    if (!tenderButton) return;

    // No target ALU: normal Prism behavior.
    if (!hasTargetALU()) {

        lastValidationState = null;

        tenderButton.disabled = false;
        tenderButton.style.pointerEvents = "";
        tenderButton.style.opacity = "";
        tenderButton.title = "";

        return;
    }

    const discountDetected = hasDiscount();

    // Block Tender only when discount exists.
    const disable = discountDetected;

    if (
        lastValidationState === disable &&
        tenderButton.disabled === disable
    ) {
        return;
    }

    lastValidationState = disable;

    tenderButton.disabled = disable;

    tenderButton.style.pointerEvents =
        disable ? "none" : "";

    tenderButton.style.opacity =
        disable ? "0.5" : "";

    tenderButton.title = disable
        ? "Tender is not allowed while a target GWP item has a discounted transaction."
        : "";
}


/*
============================================================
PREVENT TENDER CLICK IF DISCOUNT EXISTS
============================================================
*/

document.addEventListener("click", function(e) {

    const button = e.target.closest("#tenderbutton");

    if (!button) return;

    if (hasTargetALU() && hasDiscount()) {

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        updateTenderButton();

        console.warn(
            "Tender blocked: Target ALU and discount detected."
        );
    }

}, true);


/*
============================================================
MONITOR TRANSACTION CHANGES
============================================================
*/

const observer = new MutationObserver(() => {
    updateTenderButton();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});


/*
============================================================
INITIAL CHECK
============================================================
*/

updateTenderButton();

setInterval(updateTenderButton, 500);
