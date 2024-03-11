// used to get around CORS policies
const proxy = "https://corsproxy.io/?"
// leasing is for uridichesko lice
const dskInterests = { "leasing": 4.25, "student": 1.4, "credit": 3.725, "savings": 0 }

export function autoCalculator() {
    $("#form").ready(() => {
        $("#form").on("submit", async function (event) {
            event.preventDefault();

            let [budget, interest, period] = getDataFromSubmitEvent(event)
            let customMonthlyPayment = universalFormula(budget, interest, period)
            //let ubbData = await loadFromAPI(`https://www.ubb.bg/loan_calculators/calculate?loan_id=3&currency_id=1&amount=${budget}&term_length=${period}&min_payroll_amount=2000`)
            let ubbData = await ubbLeasing(budget, period)
            let unicreditData = universalFormula(budget, 1.0, period)
            let dskData = universalFormula(budget, dskInterests.leasing, period)

            loadResults(ubbData, unicreditData, dskData, customMonthlyPayment)
        })
    })
}

export function loanCalculator() {
    $("#form").ready(() => {
        $("#form").on("submit", async function (event) {
            event.preventDefault();

            let [budget, interest, period] = getDataFromSubmitEvent(event)
            let customMonthlyPayment = universalFormula(budget, interest, period)
            let ubbData = await loadFromAPI(`https://www.ubb.bg/loan_calculators/calculate?loan_id=3&currency_id=1&amount=${budget}&term_length=${period}&min_payroll_amount=2000`)
            let unicreditData = universalFormula(budget, 1.0, period)
            let dskData = universalFormula(budget, dskInterests.credit, period)

            loadResults(ubbData.monthly_installment, unicreditData, dskData, customMonthlyPayment)
        })
    })


}

export function investmentCalculator() {
    $("#form").ready(() => {
        $("#form").on("submit", async function (event) {
            event.preventDefault();

            let [budget, interest, period] = getDataFromSubmitEvent(event)
            let customMonthlyPayment = universalFormula(budget, interest, period)
            let ubbData = universalFormula(budget, 1.5, period)
            let unicreditData = universalFormula(budget, 1.0, period)
            // there is a bug with the api
            // in the UI you are limited to invest up to 1_000_000 BGN
            // but using the api you can go more than 40_000_000 
            let dskData = await loadFromAPI(`https://dskam.bg/funds-calculate?fundType=1&initialPayment=${budget}&periodicPayment=&numberOfPeriods=undefined&numberOfYears=${period}`)
            loadResults(ubbData, unicreditData, parseFloat(dskData.fullValue.replace(" ", "")) / period, customMonthlyPayment)
        })
    })
}

export function savingsCalculator() {
    $("#form").ready(() => {
        $("#form").on("submit", async function (event) {
            event.preventDefault();

            let [budget, interest, period] = getDataFromSubmitEvent(event)
            let customMonthlyPayment = universalFormula(budget, interest, period)
            let ubbData = universalFormula(budget, 0.15, period)
            let unicreditData = universalFormula(budget, 1.0, period)
            let dskData = universalFormula(budget, dskInterests.savings, period)

            loadResults(ubbData, unicreditData, dskData, customMonthlyPayment)
        })
    })
}

export function creditCalculator() {
    $("#form").ready(() => {
        $("#form").on("submit", async function (event) {
            event.preventDefault();

            let [budget, interest, period] = getDataFromSubmitEvent(event)
            let customMonthlyPayment = universalFormula(budget, interest, period)
            let ubbData = await loadFromAPI(`https://www.ubb.bg/loan_calculators/calculate?loan_id=1&currency_id=1&amount=${budget}&term_length=${period}&min_payroll_amount=2000`)
            let unicreditData = universalFormula(budget, 1.0, period)
            let dskData = universalFormula(budget, dskInterests.credit, period)

            loadResults(ubbData.monthly_installment, unicreditData, dskData, customMonthlyPayment)
        })
    })

}

export function studentCalculator() {
    $("#form").ready(() => {
        $("#form").on("submit", async function (event) {
            event.preventDefault();

            let [budget, interest, period] = getDataFromSubmitEvent(event)
            let customMonthlyPayment = universalFormula(budget, interest, period)
            let ubbData = universalFormula(budget, 1.38, period)
            let unicreditData = universalFormula(budget, 1.0, period)
            let dskData = universalFormula(budget, dskInterests.student, period)

            loadResults(ubbData, unicreditData, dskData, customMonthlyPayment)
        })
    })
}


function loadResults(ubbData, unicreditData, dskData, customMonthlyPayment) {
    let results = document.getElementById("results");
    results.style.display = "flex";



    document.getElementById("ubb").innerText = getMessageBasedOnType(ubbData);
    document.getElementById("dsk").innerText = getMessageBasedOnType(dskData);
    document.getElementById("custom").innerText = getMessageBasedOnType(customMonthlyPayment);
    document.getElementById("unicredit").innerText = getMessageBasedOnType(unicreditData);
}

function getMessageBasedOnType(value) {
    const errorMessage = `Имаше грешка при изчисляване/взимане на данните за банката.
Това може да е в резултат на избрани твърде големи сума и/или срок.
Моля пробвайте с други данни и ако проблема продължава съобщете за него.`

    if (!isNaN(value)) {
        return parseFloat(value).toFixed(2);
    } else {
        return errorMessage
    }
}

function getDataFromSubmitEvent(event) {
    let formData = new FormData(event.target);
    return [Number(formData.get("budget")), Number(formData.get("interest")), Number(formData.get("period"))];
}

function universalFormula(budget, interest, period) {
    return (budget * interest / 100 + budget) / period;
}
async function loadFromAPI(api) {
    const url = proxy + encodeURIComponent(api);

    try {
        const response = await fetch(url);
        let jsonResp = await response.json();
        if (!jsonResp.status && jsonResp.status != undefined) {

            return jsonResp.errors
        }
        return jsonResp;
    } catch (error) {
        console.error('Error during fetch:', error);
        return "";
    }
}

async function ubbLeasing(budget, period) {
    const resp = await fetch(proxy + `https://interlease.bg/en/leasing-calculator/submit?commission=&lease_type=4&range=${budget}&calc_start_fee=10&calc_period=${period}`);
    const data = await resp.json();
    const resultObject = data;
    const htmlContent = resultObject.html;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const monthlyInstalmentRow = tempDiv.querySelector('.result-info tr:nth-child(3)');
    const monthlyInstalmentValue = monthlyInstalmentRow.querySelector('td:nth-child(2)').textContent.trim();
    return parseFloat((monthlyInstalmentValue.substring(0, monthlyInstalmentValue.indexOf("BGN"))).replace(" ", ""))
}