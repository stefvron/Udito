export default function cDist(c1, c2) {
    return Math.sqrt(Math.pow(c2[0]-c1[0],2)+Math.pow(c2[1]-c1[1],2)+Math.pow(c2[2]-c1[2],2));
}
