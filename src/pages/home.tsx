import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View, ImageBackground, } from "react-native";
import { useNavigation } from '@react-navigation/native';

import React, { useEffect, useState } from "react";

import Movie from '../../models/movie';
import { onRequestMovieList } from '../../utils/apiClient';
import styles from '../../utils/styles';
import { Dropdown } from "react-native-element-dropdown";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type NavProps = NativeStackNavigationProp<RootStackParamList>;

function HomeScreen() {
    const navigation = useNavigation<NavProps>();
    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(50), (val, index) => ({
        label: (currentYear - index).toString(),
        value: currentYear - index,
    }));

    console.log("years", years.length);

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [selectedYear, setYear] = useState(null);
    const [selectedSortingMethod, setSelectedSortingMethod] = useState("ASC");
    const [selectedVideoType, setSelectedVideoType] = useState("Movie");
    const [sortType, setSortType] = useState("Title");
    const [error, setError] = useState("");


    const fetchMovies = async (query: string, year: any, type: string, pageNumber: number) => {
        setLoading(true);

        let responseData = await onRequestMovieList(query, year, type, pageNumber);

        if (!responseData) {
            setMovies([]);
            setTotalResults(0);
        } else {
            const responseMovies = Array.from(
                new Map(responseData.Search?.map((movie) => [movie.imdbID, movie])).values()
            );

            if (responseData.totalResults == "66") {
                setError(responseData.Response)
            }

            if (pageNumber == 1) {
                setError(responseData.Response)
                setMovies(responseMovies);
            } else {
                setError(responseData.Response)
                setMovies(movies => [...movies, ...responseMovies]);
            }
            setTotalResults(Number(responseData.totalResults) || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (search.trim().length > 0) {
                setPage(1)
                fetchMovies(search, selectedYear, selectedVideoType, 1);
            } else {
                setLoading(false)
                setMovies([])
            }
        }, 500)

        return () => {
            clearTimeout(handler);
        }
    }, [search]);

    const loadMore = () => {
        if (movies.length < totalResults && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMovies(search, selectedYear, selectedVideoType, nextPage)
        }
    };

    const onUpdateYear = (item: any) => {
        console.log('yeahh year');
        setYear(item.value)
        setPage(1);
        fetchMovies(search, item.value, selectedVideoType, 1)
    }

    const onUpdateVideoType = (item: any) => {
        setSelectedVideoType(item.value)
        setPage(1);
        fetchMovies(search, selectedYear, item.value, 1)
    }

    const onSortList = (method: string, type: string) => {
        setSortType(type);
        setSelectedSortingMethod(method);

        let sortedMovies: Movie[] = [];

        if (type == "Year") {
            if (method == "ASC") {
                sortedMovies = movies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year))
            } else {
                sortedMovies = movies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year))
            }
        }

        if (type == "Title") {
            if (method == "ASC") {
                sortedMovies = movies.sort((a, b) => a.Title.localeCompare(b.Title))
            } else {
                sortedMovies = movies.sort((a, b) => b.Title.localeCompare(a.Title))
            }
        }

        setMovies(sortedMovies);
    }

    const FilterDropdown = ({ data, placeholder, value, onChange }: { data: any, placeholder: string, value: any, onChange: (item: any) => void }) => (
        <Dropdown
            style={styles.dropdown}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            selectedTextStyle={{ fontSize: 12, }}
            itemTextStyle={{ fontSize: 12, color: "black" }}
            placeholderStyle={{ fontSize: 14, }}
            itemContainerStyle={{ justifyContent: "center", }}
        />
    );

    const renderItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity style={styles.item} onPress={() => { navigation.navigate('Details', {omdbId: item.imdbID}) }}>
            <ImageBackground
                source={{ uri: item.Poster }}
                style={[styles.item, { margin: 0 }]}
                imageStyle={{ borderRadius: 10 }}
            >
                <View style={styles.overlay}>
                    <Text style={{ color: "#ffff", fontSize: 12, fontWeight: "bold" }}>{item.Title}</Text>
                    <Text style={{ color: "#ffff", fontSize: 10 }}>{item.Year}</Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    const sortingMethod = ["ASC", "DESC"].map((item) => ({ label: item, value: item }));
    const sortingType = ["Year", "Title"].map((item) => ({ label: item, value: item }));
    const videoType = ["Movie", "Series"].map((item) => ({ label: item, value: item }));

    function emptyListMessage() {
        if (search != "" && movies.length == 0) {
            return "No results";
        } else if (search == "" && movies.length == 0) {
            return "Search movies";
        } else {
            return "";
        }
    }

    return (
        <View style={{ marginTop: 50, marginHorizontal: 20 }}>
            <View style={[styles.searchRow, { justifyContent: "space-between", }]}>
                <Text style={styles.title}>Movie Database</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                    <Text style={{ color: "#007AFF", fontSize: 16 }}>Favorites</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.searchRow, styles.verticalSpacingMedium]}>
                <TextInput
                    style={styles.input}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search movies..."
                />
            </View>
            <View style={styles.container}>
            </View>
            <View style={styles.filterRow}>
                <FilterDropdown
                    data={years}
                    placeholder="Year"
                    value={selectedYear}
                    onChange={(item) => { onUpdateYear(item) }}
                />
                <FilterDropdown
                    data={videoType}
                    placeholder="Type"
                    value={selectedVideoType}
                    onChange={(item) => { onUpdateVideoType(item) }}
                />
                <FilterDropdown
                    data={sortingMethod}
                    placeholder="Sort"
                    value={selectedSortingMethod}
                    onChange={(item) => { onSortList(item.value, sortType) }}
                />
                <FilterDropdown
                    data={sortingType}
                    placeholder="Type"
                    value={sortType}
                    onChange={(item) => { onSortList(selectedSortingMethod, item.value) }}
                />
            </View>
            {!loading && movies.length == 0 ? <View style={{ justifyContent: "center", alignItems: "center", height: 200 }}>
                <Text style={[styles.title, { color: "#c9c9c9" }]}>{emptyListMessage()}</Text>
            </View> : null}
            <FlatList
                data={movies}
                numColumns={3}
                keyExtractor={(item) => item.imdbID}
                renderItem={renderItem}
                onEndReached={loadMore}
                onEndReachedThreshold={1}
                ListEmptyComponent={
                    loading ? <ActivityIndicator size="large" /> : null
                }
            />
        </View>
    );
}

export default HomeScreen;