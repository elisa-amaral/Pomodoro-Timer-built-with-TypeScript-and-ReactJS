import React, { useEffect, useState, useCallback } from 'react'
import { useInterval } from '../hooks/use-interval'
import { Button } from './button'
import { Timer } from './timer'
import { secondsToMinutes } from '../utils/seconds-to-minutes'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const startSound = require('../sounds/start-sound.mp3')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const finishSound = require('../sounds/finish-sound.mp3')

const audioStartWorking = new Audio(startSound)
const audioStopWorking = new Audio(finishSound)

interface Props {
  pomodoroTime: number
  shortRestTime: number
  longRestTime: number
  cycles: number
}

export function PomodoroTimer(props: Props): JSX.Element {
  const [mainTime, setMainTime] = useState(props.pomodoroTime)
  const [timeCounting, setTimeCounting] = useState(false)
  const [working, setWorking] = useState(false)
  const [resting, setResting] = useState(false)
  const [cyclesQtdManager, setCyclesQtdManager] = useState(
    new Array(props.cycles - 1).fill(true),
  )

  const [completedCycles, setCompletedCycles] = useState(0)
  const [fullWorkingTime, setFullWorkingTime] = useState(0)
  const [numberOfPomodoros, setNumberOfPomodoros] = useState(0)

  useInterval(
    () => {
      setMainTime(mainTime - 1)
      if (working) setFullWorkingTime(fullWorkingTime + 1)
    },
    timeCounting ? 1000 : null,
  )

  const configureWork = useCallback(() => {
    setTimeCounting(true)
    setWorking(true)
    setResting(false)
    setMainTime(props.pomodoroTime)
    audioStartWorking.play()
  }, [setTimeCounting, setWorking, setResting, setMainTime, props.pomodoroTime])

  const configureRest = useCallback(
    (long: boolean) => {
      setTimeCounting(true)
      setWorking(false)
      setResting(true)

      if (long) {
        setMainTime(props.longRestTime)
      } else {
        setMainTime(props.shortRestTime)
      }

      audioStopWorking.play()
    },
    [
      setTimeCounting,
      setWorking,
      setResting,
      setMainTime,
      props.longRestTime,
      props.shortRestTime,
    ],
  )

  useEffect(() => {
    if (working) document.body.classList.add('working')
    if (resting) document.body.classList.remove('working')

    if (mainTime > 0) return

    if (working && cyclesQtdManager.length > 0) {
      configureRest(false)
      cyclesQtdManager.pop()
    } else if (working && cyclesQtdManager.length <= 0) {
      configureRest(true)
      setCyclesQtdManager(new Array(props.cycles - 1).fill(true))
      setCompletedCycles(completedCycles + 1)
    }

    if (working) setNumberOfPomodoros(numberOfPomodoros + 1)
    if (resting) configureWork()
  }, [
    working,
    resting,
    mainTime,
    cyclesQtdManager,
    numberOfPomodoros,
    completedCycles,
    configureRest,
    setCyclesQtdManager,
    configureWork,
    props.cycles,
  ])

  return (
    <div className="pomodoro">
      <h2>You currently are: {working ? 'WORKING' : 'RESTING'}</h2>
      <Timer mainTime={mainTime} />

      <div className="controls">
        <Button text="WORK" onClick={() => configureWork()}></Button>
        <Button text="REST" onClick={() => configureRest(false)}></Button>
        <Button
          className={!working && !resting ? 'hidden' : ''}
          text={timeCounting ? 'PAUSE' : 'CONTINUE'}
          onClick={() => setTimeCounting(!timeCounting)}
        ></Button>
      </div>

      <div className="details">
        <p>
          <i>One finished cycle consists in four finished pomodoros</i>
        </p>
        <br />
        <p>Number of finished pomodoros: {numberOfPomodoros}</p>
        <p>Number of finished cycles: {completedCycles}</p>
        <p>Total working time: {secondsToMinutes(fullWorkingTime)}</p>
      </div>
    </div>
  )
}
