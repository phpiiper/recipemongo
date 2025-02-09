import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import KitchenIcon from '@mui/icons-material/Kitchen';
import Autocomplete from "@mui/material/Autocomplete";
import Icon from "@/components/Icon"
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SearchIcon from "@mui/icons-material/Search";
import HelpIcon from '@mui/icons-material/Help';
import Modal from "@mui/material/Modal";
export default function Filters({Filters, onChangeFunction, List, value=""}) {
    const [open, setOpen] = React.useState(false);
    const [openHelpGuide, setOpenHelpGuide] = React.useState(false);
    const handleHelpClose = () => setOpenHelpGuide(false);
    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    return (
        <div>
            <Icon children={<FilterAltIcon />} clickEvent={toggleDrawer(true)} btnText={"Filters"} />
            <Drawer anchor={'top'} open={open} onClose={toggleDrawer(false)} id={"homepage-filter"}>
                <div id={"homepage-filter-header"}>
                    <h1>FILTERS</h1>
                    <div id={"homepage-filter-header-icons-div"}>
                        <Icon
                            children={<CloseFullscreenIcon />}
                            clickEvent={() => {
                                setOpen(false)
                                }}
                            btnText={"Close"}
                        />
                        <Icon
                            children={<HelpIcon />}
                            clickEvent={() => {
                                setOpenHelpGuide(true);
                                console.log("???", openHelpGuide)
                            }}
                            btnText={"Help"}
                        />
                        <Modal open={openHelpGuide} onClose={handleHelpClose} id={"filter-helper-modal"}>
                            <div id={"filter-helper"}>
                                <div className={"container"}>
                                    <h2>Filter: Recipe Name</h2>
                                    <p>Filter recipes by name</p>
                                    <h2>Filter: Category</h2>
                                    <p>Filter recipes by category</p>
                                    <h2>Filter: Ingredients</h2>
                                    <p>Filter recipes by ingredients; separate items with commas (,)</p>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>
                <span>Total Recipes [{value}]</span>
        <div className={'flex filter-list'}>
            <div className={'container filter'}>
                    <label htmlFor={"search-name"}><MenuBookIcon /></label>
                    <FormControl variant="outlined" style={{ marginRight: "10px" }}>
                        <TextField
                            id="search-name"
                            className={"search-forms"}
                            placeholder="Search by name..."
                            value={Filters.name}
                            onChange={(event) => onChangeFunction("name", event.target.value)}
                            label="Recipe Name"
                        />
                    </FormControl>
            </div>
            <div className={'container filter'}>
                <label htmlFor={"cat"}><LocalDiningIcon /></label>
                <FormControl variant="outlined">
                    <Autocomplete
                        disablePortal
                        autoHighlight
                        options={List.categories}
                        getOptionLabel={(option) => option?.toString() || ""}
                        sx={{ minWidth: 200 }}
                        renderInput={(params) => <TextField {...params} label="Category" />}
                        id="cat"
                        onChange={(event, newValue) => onChangeFunction("cat", newValue || "")}
                        value={Filters.cat ? Filters.cat.toString() : ""}
                    />

                </FormControl>
            </div>
            <div className={'container filter'}>
                <label htmlFor={"search-ingredients"}><KitchenIcon /></label>
                <FormControl variant="outlined">
                    <TextField
                        id="search-ingredients"
                        className="search-forms"
                        placeholder="Search by ingredients (comma-separated)..."
                        value={Filters.ingredients}
                        onChange={(event) => onChangeFunction("ingredients", event.target.value)}
                        label="Ingredients"
                    />
                </FormControl>
            </div>
        </div>
            </Drawer>
        </div>
    );
}