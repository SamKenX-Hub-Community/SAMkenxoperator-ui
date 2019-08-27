import { Grid } from '@material-ui/core'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import classNames from 'classnames'
import StatusIcon from 'components/JobRuns/StatusIcon'
import PropTypes from 'prop-types'
import React from 'react'

const styles = theme => {
  return {
    borderTop: {
      borderTop: 'solid 1px',
      borderTopColor: theme.palette.divider
    },
    item: {
      position: 'relative',
      paddingLeft: 50
    },
    status: {
      position: 'absolute',
      top: 0,
      left: 0,
      paddingTop: 25,
      paddingLeft: 30,
      borderRight: 'solid 1px',
      borderRightColor: theme.palette.divider,
      width: 50,
      height: '100%'
    },
    summary: {
      minHeight: '0 !important'
    },
    content: {
      margin: '12px 0 !important'
    },
    details: {
      padding: theme.spacing.unit * 2
    },
    expansionPanel: {
      boxShadow: 'none'
    }
  }
}

const render = (
  summary,
  children,
  classes,
  confirmations,
  minConfirmations
) => {
  if (children) {
    return (
      <ExpansionPanel className={classes.expansionPanel}>
        <ExpansionPanelSummary
          className={classes.summary}
          classes={{ content: classes.content }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Grid container alignItems="baseline">
            <Grid item sm={10}>
              <Typography variant="h5">{summary}</Typography>
            </Grid>
            <Grid item>
              {minConfirmations ? (
                <Typography variant="h6" color="secondary">
                  Confirmations {confirmations}/{minConfirmations}
                </Typography>
              ) : (
                <div />
              )}
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>{children}</ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }

  return <Typography>{summary}</Typography>
}

const StatusItem = ({
  status,
  summary,
  borderTop,
  children,
  classes,
  confirmations,
  minConfirmations
}) => (
  <div className={classNames(classes.item, { [classes.borderTop]: borderTop })}>
    <div className={classes.status}>
      <StatusIcon width={38} height={38}>
        {status}
      </StatusIcon>
    </div>
    <div className={classes.details}>
      {render(summary, children, classes, confirmations, minConfirmations)}
    </div>
  </div>
)

StatusItem.defaultProps = {
  borderTop: true
}

StatusItem.propTypes = {
  status: PropTypes.string.isRequired,
  borderTop: PropTypes.bool.isRequired
}

export default withStyles(styles)(StatusItem)
