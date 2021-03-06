import { Avatar, Box, Grid, Typography } from '@mui/material';

export function TeamMember({ member }) {
  return (
    <Box sx={{ width: 200, pb: 5 }}>
      <Grid
        container
        spacing={2}
        direction='column'
        alignItems='center'
        justifyContent='center'
      >
        <Grid item>
          <Avatar
            variant='rounded'
            sx={{ width: 112, height: 144 }}
            alt={member.name}
            src={member.img}
          />
        </Grid>
        <Grid item>
          <Typography variant='h6' color='textSecondary'>
            {member.name}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
