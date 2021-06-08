const useId = (props) => {

    let id
    if(props.match) {
        id = props.match.params.id
    } else if(props.computedMatch) {
        id = props.computedMatch.params.id
    }

    return { id }
}

export { useId }