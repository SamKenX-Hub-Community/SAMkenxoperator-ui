import React from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Button from 'components/Button'
import { Title } from 'components/Title'
import Content from 'components/Content'
import BaseLink from 'components/BaseLink'
import { v2 } from 'api'
import * as jsonapi from '@chainlink/json-api-client'
import * as models from 'core/store/models'

import { TimeAgo } from '@chainlink/styleguide'
import Card from '@material-ui/core/Card'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { FIRST_PAGE } from 'components/TableButtons'
import { formatInitiators } from 'utils/jobSpecInitiators'
import Link from 'components/Link'
import { useErrorHandler } from 'hooks/useErrorHandler'
import { useLoadingPlaceholder } from 'hooks/useLoadingPlaceholder'

const PAGE_SIZE = 1000 // We intentionally set this to a very high number to avoid pagination

export const simpleJobFilter = (search: string) => ({
  attributes,
}: jsonapi.PaginatedApiResponse<models.JobSpec>['data']) => {
  const textSearch = search.toLowerCase()
  return (
    (attributes.id && attributes.id.toLowerCase().includes(textSearch)) ||
    attributes.name.toLowerCase().includes(textSearch) ||
    attributes.initiators.some((initiator) =>
      initiator.type.includes(textSearch),
    )
  )
}

export const JobsIndex = ({ history }: RouteChildrenProps<{}>) => {
  const [search, setSearch] = React.useState('')
  React.useEffect(() => {
    document.title = 'Jobs'
  }, [])

  const [jobs, setJobs] = React.useState<
    jsonapi.PaginatedApiResponse<models.JobSpec[]>['data']
  >()
  const [jobsCount, setJobsCount] = React.useState(0)
  const { error, ErrorComponent, setError } = useErrorHandler()
  const { LoadingPlaceholder } = useLoadingPlaceholder(!error && !jobs)

  const jobFilter = React.useMemo(() => simpleJobFilter(search), [search])

  React.useEffect(() => {
    v2.specs
      .getJobSpecs(FIRST_PAGE, PAGE_SIZE)
      .then(({ data, meta }) => {
        setJobs(data)
        setJobsCount(meta.count)
      })
      .catch(setError)
  }, [setError])

  return (
    <Content>
      <Grid container>
        <Grid item xs={9}>
          <Title>Jobs</Title>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="flex-end">
            <Grid item>
              <Button
                variant="secondary"
                component={BaseLink}
                href={'/jobs/new'}
              >
                New Job
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <ErrorComponent />
          <LoadingPlaceholder />
          {!error && jobs && (
            <Card>
              <TextField
                label="Search"
                variant="outlined"
                style={{
                  margin: 16,
                }}
                name="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body1" color="textSecondary">
                        Name
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" color="textSecondary">
                        Created
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" color="textSecondary">
                        Type
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" color="textSecondary">
                        Initiator
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs && jobsCount === 0 && (
                    <TableRow>
                      <TableCell component="th" scope="row" colSpan={3}>
                        You haven’t created any jobs yet. Create a new job{' '}
                        <Link href={`/jobs/new`}>here</Link>
                      </TableCell>
                    </TableRow>
                  )}
                  {jobs &&
                    jobsCount > 0 &&
                    jobs.filter(jobFilter).map((job) => (
                      <TableRow
                        hover
                        key={job.id}
                        onClick={() => history.push(`/jobs/${job.id}`)}
                      >
                        <TableCell component="th" scope="row">
                          <Link href={`/jobs/${job.id}`}>
                            {job.attributes.name || job.id}
                            {job.attributes.name && (
                              <>
                                <br />
                                <Typography
                                  variant="subtitle2"
                                  color="textSecondary"
                                  component="span"
                                >
                                  {job.id}
                                </Typography>
                              </>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            <TimeAgo tooltip>
                              {job.attributes.createdAt || ''}
                            </TimeAgo>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            Direct request
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            {formatInitiators(job.attributes.initiators)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Grid>
      </Grid>
    </Content>
  )
}

export default JobsIndex
