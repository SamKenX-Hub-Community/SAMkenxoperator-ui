import React from 'react'
import { Link as ReactStaticLink } from 'react-router-dom'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { grey } from '@material-ui/core/colors'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'
import { PropTypes } from '@material-ui/core'
import classNames from 'classnames'

type Variant = ThemeStyle | 'srOnly'
type Color = PropTypes.Color | 'textPrimary' | 'textSecondary' | 'error'

const styles = (_theme: Theme) =>
  createStyles({
    link: {
      color: grey[900],
      textDecoration: 'none'
    },
    linkContent: {
      display: 'inline-block'
    }
  })

interface IProps extends WithStyles<typeof styles> {
  children: React.ReactNode
  to: string
  variant?: Variant
  color?: Color
  className?: string
}

const Link = ({ children, classes, className, to, variant, color }: IProps) => {
  const v = variant || 'body1'
  const c = color || 'inherit'

  return (
    <ReactStaticLink to={to} className={classNames(classes.link, className)}>
      <Typography variant={v} color={c} className={classes.linkContent}>
        {children}
      </Typography>
    </ReactStaticLink>
  )
}

export default withStyles(styles)(Link)
