import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
  },
  logo: {
    width: 50,
    fill: 'white',
  },
  title: {
    marginLeft: theme.spacing(2),
  },
  nav: {
    marginLeft: theme.spacing(4),
    flexGrow: 1,
    display: 'flex',
  },
  link: {
    fontSize: theme.spacing(2),
    color: 'white',
    textDecoration: 'none',
  },
  action: {
    textDecoration: 'none',
    color: 'white',
  },
  user: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    textDecoration: 'none',
    color: 'white',
  },
}));
