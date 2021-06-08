

 const formatAmount = (cents) => {

    return '$' + (cents/100).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

export { formatAmount }