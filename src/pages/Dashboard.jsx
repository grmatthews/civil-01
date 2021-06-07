import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Header from "../components/Header"
import { Doughnut } from "react-chartjs-2"

const useStyles = makeStyles((theme) => ({
    pageContent: {
        margin: theme.spacing(2),
        padding: theme.spacing(2),
    },
    chart: {
        width: '500',
        height: '500',
        position: 'relative',
        display: 'flex'
    }
}))

function Dashboard() {
    const classes = useStyles()

    const data = {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
            {
                label: "# of Votes",
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    return (
        <>
            <Header title='Dashboard' />

            <div className={classes.chart}> 
                <Doughnut data={data} width={3} height={3}/>
                </div>
          
        </>
    )
}

export default Dashboard
