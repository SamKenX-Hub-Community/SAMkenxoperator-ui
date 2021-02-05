import React from 'react'
import Radio from '@material-ui/core/Radio'
import {
  JobSpecFormats,
  JobSpecFormat,
  getJobSpecFormat,
  isJson,
  isToml,
  getTaskList,
} from './utils'
import { ApiResponse } from 'utils/json-api-client'
import Button from 'components/Button'
import * as api from 'api'
import { useDispatch } from 'react-redux'
import {
  OcrJobSpecRequest,
  OcrJobSpec,
  JobSpecRequest,
} from 'core/store/models'
import { JobSpec } from 'core/store/presenters'
import BaseLink from 'components/BaseLink'
import ErrorMessage from 'components/Notifications/DefaultError'
import { notifySuccess, notifyError } from 'actionCreators'
import * as storage from 'utils/local-storage'
import Content from 'components/Content'
import {
  TextField,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Divider,
  CardHeader,
  CircularProgress,
  Typography,
} from '@material-ui/core'
import {
  createStyles,
  withStyles,
  WithStyles,
  Theme,
} from '@material-ui/core/styles'
import { useLocation, useHistory } from 'react-router-dom'
import { TaskSpec } from 'core/store/models'
import TaskListDag from './TaskListDag'
import TaskList from 'components/Jobs/TaskList'
import { Stratify } from './parseDot'

const jobSpecFormatList = [JobSpecFormats.JSON, JobSpecFormats.TOML]

export const SELECTED_FORMAT = 'persistSpec.format'
export const PERSIST_SPEC = 'persistSpec.'

const styles = (theme: Theme) =>
  createStyles({
    card: {
      marginBottom: theme.spacing.unit * 3,
    },
    loader: {
      position: 'absolute',
    },
    emptyTasks: {
      padding: theme.spacing.unit * 3,
    },
  })

const SuccessNotification = ({ id }: { id: string }) => (
  <>
    Successfully created job{' '}
    <BaseLink id="created-job" href={`/jobs/${id}`}>
      {id}
    </BaseLink>
  </>
)

export function validate({
  format,
  value,
}: {
  format: JobSpecFormats
  value: string
}) {
  if (value.trim() === '') {
    return false
  } else if (format === JobSpecFormats.JSON && isJson({ value })) {
    return true
  } else if (format === JobSpecFormats.TOML && isToml({ value })) {
    return true
  } else {
    return false
  }
}

function apiCall({
  format,
  value,
}: {
  format: JobSpecFormats
  value: string
}): Promise<ApiResponse<JobSpec | OcrJobSpec>> {
  if (format === JobSpecFormats.JSON) {
    const definition: JobSpecRequest = JSON.parse(value)
    return api.v2.specs.createJobSpec(definition)
  }

  if (format === JobSpecFormats.TOML) {
    const definition: OcrJobSpecRequest = { toml: value }
    return api.v2.ocrSpecs.createJobSpec(definition)
  }

  return Promise.reject('Invalid format')
}

function getInitialValues({
  query,
}: {
  query: string
}): { jobSpec: string; format: JobSpecFormats } {
  const params = new URLSearchParams(query)
  const queryJobSpec = params.get('definition') as string
  const queryJobSpecFormat =
    getJobSpecFormat({
      value: queryJobSpec,
    }) || JobSpecFormats.JSON

  if (queryJobSpec) {
    storage.set(`${PERSIST_SPEC}${queryJobSpecFormat}`, queryJobSpec)
    return {
      jobSpec: queryJobSpec,
      format: queryJobSpecFormat,
    }
  }

  const lastOpenedFormat =
    JobSpecFormats[params.get('format')?.toUpperCase() as JobSpecFormat] ||
    storage.get(SELECTED_FORMAT) ||
    JobSpecFormats.JSON

  const lastOpenedJobSpec =
    storage.get(`${PERSIST_SPEC}${lastOpenedFormat}`) || ''

  return {
    jobSpec: lastOpenedJobSpec,
    format: lastOpenedFormat,
  }
}

export const New = ({
  classes,
}: {
  classes: WithStyles<typeof styles>['classes']
}) => {
  const location = useLocation()
  const [initialValues] = React.useState(
    getInitialValues({
      query: location.search,
    }),
  )
  const [format, setFormat] = React.useState<JobSpecFormats>(
    initialValues.format,
  )
  const [value, setValue] = React.useState<string>(initialValues.jobSpec)
  const [valid, setValid] = React.useState<boolean>(true)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [tasks, setTasks] = React.useState<{
    list: boolean | TaskSpec[] | Stratify[]
    format: false | JobSpecFormats
  }>(getTaskList({ value: initialValues.jobSpec }))
  const dispatch = useDispatch()
  const history = useHistory()

  React.useEffect(() => {
    setTasks(getTaskList({ value }))
  }, [value])

  function handleFormat(_event: React.ChangeEvent<{}>, format: string) {
    setValue(storage.get(`${PERSIST_SPEC}${format}`) || '')
    setFormat(format as JobSpecFormats)
    storage.set(SELECTED_FORMAT, format)
    setValid(true)
    history.replace({
      search: `?format=${format}`,
    })
  }

  function handleValue(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value)
    storage.set(`${PERSIST_SPEC}${format}`, event.target.value)
    setValid(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const isValid = validate({ format, value })
    setValid(isValid)

    if (isValid) {
      setLoading(true)

      apiCall({
        format,
        value,
      })
        .then(({ data }) => {
          dispatch(notifySuccess(SuccessNotification, data))
        })
        .catch((error) => {
          dispatch(notifyError(ErrorMessage, error))
          setValid(false)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  return (
    <Content>
      <Grid container spacing={40}>
        <Grid item xs={12} lg={8}>
          <Card className={classes.card}>
            <CardHeader title="New Job" />
            <Divider />
            <CardContent>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <FormLabel>Job Spec Format</FormLabel>
                      <RadioGroup
                        name="select-format"
                        value={format}
                        onChange={handleFormat}
                        row
                      >
                        {jobSpecFormatList.map((format) => (
                          <FormControlLabel
                            key={format}
                            value={format}
                            control={<Radio />}
                            label={format}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormLabel>Job Spec</FormLabel>
                    <TextField
                      error={!valid}
                      value={value}
                      onChange={handleValue}
                      helperText={!valid && `Invalid ${format}`}
                      autoComplete="off"
                      label={`${format} blob`}
                      rows={10}
                      rowsMax={25}
                      placeholder={`Paste ${format}`}
                      multiline
                      margin="normal"
                      name="jobSpec"
                      id="jobSpec"
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      data-testid="new-job-spec-submit"
                      variant="primary"
                      type="submit"
                      size="large"
                      disabled={loading}
                    >
                      Create Job
                      {loading && (
                        <CircularProgress
                          className={classes.loader}
                          size={30}
                          color="primary"
                        />
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card style={{ overflow: 'visible' }} className={classes.card}>
            <CardHeader title="Task list preview" />
            <Divider />
            {tasks.format === JobSpecFormats.JSON && tasks.list && (
              <TaskList tasks={tasks.list as TaskSpec[]} />
            )}
            {tasks.format === JobSpecFormats.TOML && tasks.list && (
              <TaskListDag stratify={tasks.list as Stratify[]} />
            )}
            {!tasks.list && (
              <Typography
                className={classes.emptyTasks}
                variant="body1"
                color="textSecondary"
              >
                Tasks not found
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Content>
  )
}

export default withStyles(styles)(New)
