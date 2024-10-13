import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1565c0',  // Cor principal
        },
        secondary: {
            main: '#f1f3f4',  // Cor secundária
        },
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
    },
});

export default theme;
